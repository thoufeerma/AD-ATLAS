import { createHash, randomBytes } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import type { Request } from "express";
import type { CustomerTokenKind } from "../generated/prisma/client.js";
import { prisma } from "../db.js";
import { env, isProd } from "../env.js";

/**
 * Storefront customer accounts. Separate cookie, separate token audience,
 * separate rules from admin sessions — nothing a customer holds works on the
 * admin API, and vice versa.
 */
export const CUSTOMER_COOKIE = "vel_customer";
const REMEMBER_SECONDS = 60 * 60 * 24 * 30; // "keep me signed in"
const SESSION_SECONDS = 60 * 60 * 12; // otherwise: until the browser closes (max 12h)
const secret = new TextEncoder().encode(env.JWT_SECRET);

export async function signCustomerSession(c: { id: string; sessionVersion: number }, remember: boolean) {
  return new SignJWT({ ver: c.sessionVersion, rem: remember })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience("customer")
    .setSubject(c.id)
    .setIssuedAt()
    .setExpirationTime(`${remember ? REMEMBER_SECONDS : SESSION_SECONDS}s`)
    .sign(secret);
}

/** Cookie options: persistent only when they asked to stay signed in. */
export function customerCookieOptions(remember: boolean) {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    ...(remember ? { maxAge: REMEMBER_SECONDS * 1000 } : {}),
  };
}

/**
 * The signed-in customer (and whether they chose to stay signed in), or null.
 * Re-read from the database on every call, so a password change (which bumps
 * sessionVersion) ends old sessions at once.
 */
export async function currentCustomer(req: Request) {
  const token = req.cookies?.[CUSTOMER_COOKIE];
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"], audience: "customer" });
    if (typeof payload.sub !== "string" || typeof payload.ver !== "number") return null;
    const customer = await prisma.customer.findUnique({ where: { id: payload.sub } });
    if (!customer?.passwordHash || customer.sessionVersion !== payload.ver) return null;
    return { customer, remember: payload.rem === true };
  } catch {
    return null;
  }
}

/* ── Passwords ── */

export const CUSTOMER_PASSWORD_MIN = 8;

export function customerPasswordProblem(password: string, email: string): string | null {
  if (password.length < CUSTOMER_PASSWORD_MIN) return `Use at least ${CUSTOMER_PASSWORD_MIN} characters.`;
  if (password.length > 200) return "Use at most 200 characters.";
  const local = email.split("@")[0]?.toLowerCase() ?? "";
  if (local.length >= 4 && password.toLowerCase().includes(local)) {
    return "Don't include your email address in your password.";
  }
  if (new Set(password.toLowerCase()).size < 4) return "Use a less repetitive password.";
  return null;
}

/* ── One-time email links ── */

const TOKEN_TTL: Record<CustomerTokenKind, number> = {
  VERIFY_EMAIL: 48 * 60 * 60 * 1000,
  RESET_PASSWORD: 60 * 60 * 1000,
};

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

/**
 * Issues a fresh link token (replacing any earlier unused one of the same
 * kind) and returns the raw value to put in the email. Only its hash is kept.
 */
export async function issueToken(customerId: string, kind: CustomerTokenKind) {
  const raw = randomBytes(32).toString("base64url");
  await prisma.$transaction([
    prisma.customerToken.deleteMany({ where: { customerId, kind, usedAt: null } }),
    prisma.customerToken.create({
      data: { customerId, kind, tokenHash: sha256(raw), expiresAt: new Date(Date.now() + TOKEN_TTL[kind]) },
    }),
  ]);
  return raw;
}

/** A still-usable token and its customer, without spending it. */
export async function peekToken(raw: string, kind: CustomerTokenKind) {
  const token = await prisma.customerToken.findUnique({
    where: { tokenHash: sha256(raw) },
    include: { customer: true },
  });
  if (!token || token.kind !== kind || token.usedAt || token.expiresAt < new Date()) return null;
  return token;
}

/**
 * Marks a token used and returns its customer id, or null if it's unknown,
 * expired or already used. Single-use is enforced with a conditional update,
 * so two clicks racing can't both succeed.
 */
export async function consumeToken(raw: string, kind: CustomerTokenKind) {
  const token = await prisma.customerToken.findUnique({ where: { tokenHash: sha256(raw) } });
  if (!token || token.kind !== kind || token.usedAt || token.expiresAt < new Date()) return null;
  const { count } = await prisma.customerToken.updateMany({
    where: { id: token.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  return count === 1 ? token.customerId : null;
}
