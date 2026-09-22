import { Router, type Request, type Response } from "express";
import { z } from "zod";
import type { Customer } from "../../generated/prisma/client.js";
import { prisma } from "../../db.js";
import { badRequest, conflict, HttpError, notFound, param, parse, parsePatch, tooMany, unauthorized } from "../../lib/http.js";
import { clientIp } from "../../lib/clientIp.js";
import { invoiceLink } from "../../lib/invoices.js";
import {
  clearLoginAttempts,
  getDummyHash,
  hashPassword,
  isLoginLocked,
  registerFailedLogin,
  verifyPassword,
} from "../../lib/auth.js";
import {
  CUSTOMER_COOKIE,
  consumeToken,
  currentCustomer,
  customerCookieOptions,
  customerPasswordProblem,
  issueToken,
  peekToken,
  signCustomerSession,
} from "../../lib/customerAuth.js";
import { afterResponse } from "../../lib/mail.js";
import { mailContext, passwordResetEmail, verifyEmail } from "../../lib/emails.js";
import { rateLimit } from "../../middleware/rateLimit.js";
import { AddressFields, IndianMobile } from "../../lib/validate.js";

/**
 * Storefront customer accounts: sign-up, sign-in, profile, saved addresses and
 * order history. Everything is under /account and uses its own cookie.
 *
 * Order history is only shown once the email is verified. Guest orders are
 * linked by email address, so merely signing up with someone's address must
 * never be enough to read their orders and home address.
 */
export const accountRouter = Router();

const tenMinutes = 10 * 60_000;
const registerLimit = rateLimit({ name: "sign-up", max: 10, windowMs: tenMinutes });
const emailLimit = rateLimit({ name: "email", max: 5, windowMs: tenMinutes });

const me = (c: Customer) => ({
  id: c.id,
  name: c.name,
  email: c.email,
  // A sign-up can land on an existing guest record (same email). Until the
  // email is verified, nothing that came from that guest's orders is shown.
  phone: c.emailVerifiedAt ? c.phone : null,
  emailVerified: c.emailVerifiedAt !== null,
});

async function startSession(res: Response, c: Customer, remember: boolean) {
  res.cookie(CUSTOMER_COOKIE, await signCustomerSession(c, remember), customerCookieOptions(remember));
}

async function signedIn(req: Request) {
  const session = await currentCustomer(req);
  if (!session) throw unauthorized("Please sign in");
  return session;
}

function sendVerification(c: Customer) {
  afterResponse(async () => {
    const token = await issueToken(c.id, "VERIFY_EMAIL");
    const { store } = await mailContext();
    return [verifyEmail(c, token, store)];
  });
}

/* ── Sign up / in / out ───────────────────────────────────────────────── */

const RegisterBody = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().transform((e) => e.toLowerCase()),
  password: z.string().max(200),
  remember: z.boolean().default(true),
});

accountRouter.post("/register", registerLimit, async (req, res) => {
  const body = parse(RegisterBody, req.body);
  const problem = customerPasswordProblem(body.password, body.email);
  if (problem) throw badRequest(problem, [{ path: "password", message: problem }]);

  const existing = await prisma.customer.findUnique({ where: { email: body.email } });
  if (existing?.passwordHash) {
    throw conflict("There's already an account with this email — sign in, or reset your password");
  }

  const passwordHash = await hashPassword(body.password);
  // Someone who checked out as a guest gets an account on the same record;
  // their past orders appear once they've verified the email is theirs.
  const customer = existing
    ? await prisma.customer.update({
        where: { id: existing.id },
        data: { name: body.name, passwordHash, lastLoginAt: new Date() },
      })
    : await prisma.customer.create({
        data: { name: body.name, email: body.email, passwordHash, lastLoginAt: new Date() },
      });

  await startSession(res, customer, body.remember);
  sendVerification(customer);
  res.status(201).json({ data: me(customer) });
});

const LoginBody = z.object({
  email: z.email().transform((e) => e.toLowerCase()),
  password: z.string().min(1).max(200),
  remember: z.boolean().default(true),
});

accountRouter.post("/login", async (req, res) => {
  const body = parse(LoginBody, req.body);
  const throttleKey = `customer:${clientIp(req)}:${body.email}`;
  if (isLoginLocked(throttleKey)) throw tooMany("Too many failed attempts. Try again in 15 minutes.");

  const customer = await prisma.customer.findUnique({ where: { email: body.email } });
  // One bcrypt comparison either way, so timing doesn't reveal which emails
  // have accounts; one message for every failure.
  const ok = await verifyPassword(body.password, customer?.passwordHash ?? (await getDummyHash()));
  if (!customer?.passwordHash || !ok) {
    registerFailedLogin(throttleKey);
    throw unauthorized("Incorrect email or password");
  }
  clearLoginAttempts(throttleKey);

  const updated = await prisma.customer.update({ where: { id: customer.id }, data: { lastLoginAt: new Date() } });
  await startSession(res, updated, body.remember);
  res.json({ data: me(updated) });
});

accountRouter.post("/logout", (_req, res) => {
  res.clearCookie(CUSTOMER_COOKIE, customerCookieOptions(false));
  res.status(204).end();
});

/* ── Profile ──────────────────────────────────────────────────────────── */

accountRouter.get("/me", async (req, res) => {
  const { customer } = await signedIn(req);
  res.json({ data: me(customer) });
});

const ProfileBody = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.union([IndianMobile, z.literal("").transform(() => null), z.null()]),
});

accountRouter.patch("/me", async (req, res) => {
  const { customer } = await signedIn(req);
  const data = parsePatch(ProfileBody, req.body);
  const updated = await prisma.customer.update({ where: { id: customer.id }, data });
  res.json({ data: me(updated) });
});

const PasswordBody = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().max(200),
});

/** Change password. Signs out every other device; this one stays signed in. */
accountRouter.post("/password", async (req, res) => {
  const { customer, remember } = await signedIn(req);
  const body = parse(PasswordBody, req.body);
  const throttleKey = `customer-password:${customer.id}`;
  if (isLoginLocked(throttleKey)) throw tooMany("Too many wrong attempts. Try again in 15 minutes.");

  if (!(await verifyPassword(body.currentPassword, customer.passwordHash!))) {
    registerFailedLogin(throttleKey);
    throw badRequest("Your current password is incorrect", [
      { path: "currentPassword", message: "That isn't your current password." },
    ]);
  }
  clearLoginAttempts(throttleKey);
  const problem =
    body.newPassword === body.currentPassword
      ? "Choose a password different from your current one."
      : customerPasswordProblem(body.newPassword, customer.email);
  if (problem) throw badRequest(problem, [{ path: "newPassword", message: problem }]);

  const updated = await prisma.customer.update({
    where: { id: customer.id },
    data: { passwordHash: await hashPassword(body.newPassword), sessionVersion: { increment: 1 } },
  });
  await startSession(res, updated, remember);
  res.json({ data: me(updated) });
});

/* ── Email verification ───────────────────────────────────────────────── */

accountRouter.post("/verify/resend", emailLimit, async (req, res) => {
  const { customer } = await signedIn(req);
  if (customer.emailVerifiedAt) {
    res.json({ data: { alreadyVerified: true } });
    return;
  }
  sendVerification(customer);
  res.json({ data: { sent: true } });
});

/** Opened from the emailed link — works without being signed in. */
accountRouter.post("/verify", async (req, res) => {
  const { token } = parse(z.object({ token: z.string().min(10).max(200) }), req.body);
  const customerId = await consumeToken(token, "VERIFY_EMAIL");
  if (!customerId) throw badRequest("This link has expired or was already used. Sign in and send a new one.");
  await prisma.customer.updateMany({
    where: { id: customerId, emailVerifiedAt: null },
    data: { emailVerifiedAt: new Date() },
  });
  res.json({ data: { verified: true } });
});

/* ── Forgotten password ───────────────────────────────────────────────── */

/**
 * Always answers the same way, so it can't be used to find out which emails
 * have accounts. The link only goes to the address on the account.
 */
accountRouter.post("/password/forgot", emailLimit, async (req, res) => {
  const { email } = parse(z.object({ email: z.email().transform((e) => e.toLowerCase()) }), req.body);
  const customer = await prisma.customer.findUnique({ where: { email } });
  if (customer?.passwordHash) {
    afterResponse(async () => {
      const token = await issueToken(customer.id, "RESET_PASSWORD");
      const { store } = await mailContext();
      return [passwordResetEmail(customer, token, store)];
    });
  }
  res.json({ data: { sent: true } });
});

const ResetBody = z.object({
  token: z.string().min(10).max(200),
  password: z.string().max(200),
});

/**
 * Sets a new password from an emailed link. Using the link proves they own
 * the inbox, so it also verifies the email. Ends every other session.
 */
accountRouter.post("/password/reset", async (req, res) => {
  const body = parse(ResetBody, req.body);
  const expired = "This link has expired or was already used. Ask for a new one.";

  // Check the password against the account before spending the one-time link.
  const pending = await peekToken(body.token, "RESET_PASSWORD");
  if (!pending) throw badRequest(expired);
  const problem = customerPasswordProblem(body.password, pending.customer.email);
  if (problem) throw badRequest(problem, [{ path: "password", message: problem }]);

  const customerId = await consumeToken(body.token, "RESET_PASSWORD");
  if (!customerId) throw badRequest(expired);

  const updated = await prisma.customer.update({
    where: { id: customerId },
    data: {
      passwordHash: await hashPassword(body.password),
      emailVerifiedAt: pending.customer.emailVerifiedAt ?? new Date(),
      sessionVersion: { increment: 1 },
    },
  });
  await startSession(res, updated, false);
  res.json({ data: me(updated) });
});

/* ── Order history ────────────────────────────────────────────────────── */

accountRouter.get("/orders", async (req, res) => {
  const { customer } = await signedIn(req);
  if (!customer.emailVerifiedAt) {
    throw new HttpError(403, "EMAIL_NOT_VERIFIED", "Confirm your email address to see your orders");
  }
  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    orderBy: { placedAt: "desc" },
    take: 100,
    include: {
      items: { include: { product: { select: { slug: true } } } },
      creditNotes: { orderBy: { issuedAt: "asc" }, select: { id: true, number: true, issuedAt: true, totalPaise: true } },
    },
  });
  res.json({
    data: await Promise.all(orders.map(async (o) => ({
      number: o.number,
      status: o.status,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      placedAt: o.placedAt,
      totalPaise: o.totalPaise,
      shippingMethod: o.shippingMethod,
      invoice: await invoiceLink(o),
      items: o.items.map((i) => ({
        slug: i.product?.slug ?? null,
        name: i.productName,
        shade: i.shadeName,
        quantity: i.quantity,
        lineTotalPaise: i.lineTotalPaise,
      })),
    }))),
  });
});

/* ── Saved addresses ──────────────────────────────────────────────────── */

const MAX_ADDRESSES = 10;

const AddressBody = AddressFields.extend({
  fullName: z.string().trim().min(2).max(100),
  phone: IndianMobile,
  isDefault: z.boolean().default(false),
});

const addressFields = {
  id: true,
  fullName: true,
  phone: true,
  line1: true,
  line2: true,
  city: true,
  state: true,
  pincode: true,
  isDefault: true,
} as const;

const listAddresses = (customerId: string) =>
  prisma.address.findMany({
    where: { customerId },
    orderBy: [{ isDefault: "desc" }, { id: "asc" }],
    select: addressFields,
  });

accountRouter.get("/addresses", async (req, res) => {
  const { customer } = await signedIn(req);
  res.json({ data: await listAddresses(customer.id) });
});

accountRouter.post("/addresses", async (req, res) => {
  const { customer } = await signedIn(req);
  const body = parse(AddressBody, req.body);
  const count = await prisma.address.count({ where: { customerId: customer.id } });
  if (count >= MAX_ADDRESSES) throw conflict(`You can save up to ${MAX_ADDRESSES} addresses — remove one first`);
  const isDefault = body.isDefault || count === 0;
  await prisma.$transaction([
    ...(isDefault ? [prisma.address.updateMany({ where: { customerId: customer.id }, data: { isDefault: false } })] : []),
    prisma.address.create({ data: { ...body, isDefault, customerId: customer.id } }),
  ]);
  res.status(201).json({ data: await listAddresses(customer.id) });
});

async function ownAddress(req: Request, customerId: string) {
  const address = await prisma.address.findUnique({ where: { id: param(req, "id") } });
  // Someone else's address id is treated exactly like one that doesn't exist.
  if (!address || address.customerId !== customerId) throw notFound("Address");
  return address;
}

accountRouter.patch("/addresses/:id", async (req, res) => {
  const { customer } = await signedIn(req);
  const address = await ownAddress(req, customer.id);
  const data = parsePatch(AddressBody, req.body);
  await prisma.$transaction([
    ...(data.isDefault ? [prisma.address.updateMany({ where: { customerId: customer.id }, data: { isDefault: false } })] : []),
    prisma.address.update({ where: { id: address.id }, data }),
  ]);
  res.json({ data: await listAddresses(customer.id) });
});

accountRouter.delete("/addresses/:id", async (req, res) => {
  const { customer } = await signedIn(req);
  const address = await ownAddress(req, customer.id);
  await prisma.address.delete({ where: { id: address.id } });
  // Keep one address as the default if any are left.
  if (address.isDefault) {
    const next = await prisma.address.findFirst({ where: { customerId: customer.id }, orderBy: { id: "asc" } });
    if (next) await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
  }
  res.json({ data: await listAddresses(customer.id) });
});


/* ── Wishlist ─────────────────────────────────────────────────────────── */

/**
 * Kept against the account so it follows the shopper between their phone and
 * their laptop. The browser keeps its own copy as well (guests have nothing
 * else), and the two are reconciled when they sign in — see lib/wishlist.ts
 * on the storefront.
 */
const MAX_WISHLIST = 100;

const WishBody = z.object({ slug: z.string().trim().min(1).max(120) });
const MergeBody = z.object({ slugs: z.array(z.string().trim().min(1).max(120)).max(MAX_WISHLIST) });

/** Newest first, skipping products that have since been deleted. */
async function listWishlist(customerId: string) {
  const rows = await prisma.wishlistItem.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    select: { product: { select: { slug: true } } },
  });
  return rows.map((r) => r.product.slug);
}

accountRouter.get("/wishlist", async (req, res) => {
  const { customer } = await signedIn(req);
  res.json({ data: await listWishlist(customer.id) });
});

/** Adds products by slug, ignoring ones already saved. Returns the whole list. */
async function saveToWishlist(customerId: string, slugs: string[]) {
  if (slugs.length === 0) return;
  const [products, saved] = await Promise.all([
    prisma.product.findMany({ where: { slug: { in: [...new Set(slugs)] } }, select: { id: true } }),
    prisma.wishlistItem.findMany({ where: { customerId }, select: { productId: true } }),
  ]);
  const already = new Set(saved.map((w) => w.productId));
  const adding = products.filter((p) => !already.has(p.id));
  if (adding.length === 0) return;
  const room = MAX_WISHLIST - saved.length;
  if (room <= 0) throw conflict(`A wishlist holds up to ${MAX_WISHLIST} items — remove one first`);
  await prisma.wishlistItem.createMany({
    data: adding.slice(0, room).map((p) => ({ customerId, productId: p.id })),
    skipDuplicates: true,
  });
}

accountRouter.post("/wishlist", async (req, res) => {
  const { customer } = await signedIn(req);
  const { slug } = parse(WishBody, req.body);
  const product = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
  if (!product) throw notFound("Product");
  await saveToWishlist(customer.id, [slug]);
  res.json({ data: await listWishlist(customer.id) });
});

/** "Clear all", from the wishlist page. */
accountRouter.delete("/wishlist", async (req, res) => {
  const { customer } = await signedIn(req);
  await prisma.wishlistItem.deleteMany({ where: { customerId: customer.id } });
  res.json({ data: [] });
});

accountRouter.delete("/wishlist/:slug", async (req, res) => {
  const { customer } = await signedIn(req);
  await prisma.wishlistItem.deleteMany({
    where: { customerId: customer.id, product: { slug: param(req, "slug") } },
  });
  res.json({ data: await listWishlist(customer.id) });
});

/**
 * Signing in on a new device: whatever was saved in that browser joins the
 * account's list, and the merged list comes back. Afterwards the account is
 * the one that counts, so removing something doesn't come back.
 */
accountRouter.post("/wishlist/merge", async (req, res) => {
  const { customer } = await signedIn(req);
  const { slugs } = parse(MergeBody, req.body);
  await saveToWishlist(customer.id, slugs);
  res.json({ data: await listWishlist(customer.id) });
});
