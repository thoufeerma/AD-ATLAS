import type { Order, OrderItem, OrderStatus, ReturnReason, ReturnStatus } from "../generated/prisma/client.js";
import { prisma } from "../db.js";
import { env } from "../env.js";
import { formatInr } from "./money.js";
import type { Email } from "./mail.js";
import { readNotifications, type NotificationSettings } from "./settings.js";

/**
 * The store's emails. Plain, table-based HTML with inline styles (what email
 * clients reliably render) plus a text version. Everything a shopper typed is
 * escaped: a contact message must not be able to inject markup into the
 * team's inbox.
 */

type Store = { name: string; legalEntity: string; supportEmail: string; supportPhone: string };
type OrderWithItems = Order & { items: OrderItem[] };

export async function mailContext(): Promise<{ store: Store; notifications: NotificationSettings }> {
  const rows = await prisma.setting.findMany({ where: { key: { in: ["store", "notifications"] } } });
  const values = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const store = (values.store ?? {}) as Partial<Store>;
  return {
    store: {
      name: store.name ?? "Velastia",
      legalEntity: store.legalEntity ?? "",
      supportEmail: store.supportEmail ?? "",
      supportPhone: store.supportPhone ?? "",
    },
    notifications: readNotifications(values.notifications),
  };
}

/* ── Building blocks ──────────────────────────────────────────────────── */

const esc = (s: string | null | undefined) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** Escaped, with line breaks kept — for messages people typed. */
const escLines = (s: string) => esc(s).replace(/\r?\n/g, "<br>");

const FONT = "font-family:Arial,Helvetica,sans-serif";
const INK = "#2a122b";
const SOFT = "#6b5a63";

function layout(store: Store, preheader: string, body: string) {
  const footer = [
    store.supportEmail &&
      `Questions? Reply to this email or write to <a href="mailto:${esc(store.supportEmail)}" style="color:#8a5a26">${esc(store.supportEmail)}</a>.`,
    store.legalEntity && `${esc(store.name)} is a brand of ${esc(store.legalEntity)}.`,
  ]
    .filter(Boolean)
    .join("<br>");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(store.name)}</title></head>
<body style="margin:0;padding:0;background:#f9f3ed">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9f3ed">
<tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden">
<tr><td style="background:#250b30;padding:18px 28px"><img src="${env.STORE_URL}/brand/logo-light.png" alt="${esc(store.name)}" width="148" height="50" style="display:block;border:0"></td></tr>
<tr><td style="padding:28px;${FONT};color:${INK};font-size:14px;line-height:1.6">${body}</td></tr>
<tr><td style="padding:18px 28px;background:#fcf6f2;${FONT};font-size:12px;line-height:1.6;color:${SOFT}">${footer}</td></tr>
</table></td></tr></table></body></html>`;
}

const h1 = (text: string) =>
  `<h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:normal;color:#250b30">${text}</h1>`;
const p = (html: string) => `<p style="margin:0 0 14px">${html}</p>`;
const button = (href: string, label: string) =>
  `<p style="margin:22px 0"><a href="${esc(href)}" style="display:inline-block;background:#250b30;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:4px;${FONT};font-size:13px;letter-spacing:1px;text-transform:uppercase">${esc(label)}</a></p>`;
const heading = (text: string) =>
  `<p style="margin:22px 0 8px;${FONT};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#8a5a26">${text}</p>`;

const trackUrl = (o: Order) => `${env.STORE_URL}/track-order?order=${encodeURIComponent(o.number)}`;
const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;
const METHOD: Record<string, string> = {
  COD: "Cash on delivery",
  UPI: "UPI",
  CARD: "Card",
  NETBANKING: "Net banking",
  WALLET: "Wallet",
};

function itemsTable(o: OrderWithItems) {
  const row = (label: string, value: string, strong = false) =>
    `<tr><td style="padding:6px 0;color:${strong ? INK : SOFT}${strong ? ";font-weight:bold" : ""}">${label}</td><td align="right" style="padding:6px 0${strong ? ";font-weight:bold" : ""}">${value}</td></tr>`;
  const lines = o.items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #f2e8de">${esc(i.productName)}${i.shadeName ? ` <span style="color:${SOFT}">· ${esc(i.shadeName)}</span>` : ""} <span style="color:${SOFT}">× ${i.quantity}</span></td><td align="right" style="padding:8px 0;border-bottom:1px solid #f2e8de">${formatInr(i.lineTotalPaise)}</td></tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${FONT};font-size:14px;color:${INK}">
${lines}
${row("Subtotal", formatInr(o.subtotalPaise))}
${o.discountPaise > 0 ? row(`Discount${o.couponCode ? ` (${esc(o.couponCode)})` : ""}`, `– ${formatInr(o.discountPaise)}`) : ""}
${row(`Shipping${o.shippingMethod ? ` (${esc(o.shippingMethod)})` : ""}`, o.shippingPaise === 0 ? "Free" : formatInr(o.shippingPaise))}
${row("Total (incl. GST)", formatInr(o.totalPaise), true)}
</table>`;
}

const itemsText = (o: OrderWithItems) =>
  [
    ...o.items.map((i) => `- ${i.productName}${i.shadeName ? ` (${i.shadeName})` : ""} x ${i.quantity}: ${formatInr(i.lineTotalPaise)}`),
    `Subtotal: ${formatInr(o.subtotalPaise)}`,
    ...(o.discountPaise > 0 ? [`Discount${o.couponCode ? ` (${o.couponCode})` : ""}: -${formatInr(o.discountPaise)}`] : []),
    `Shipping${o.shippingMethod ? ` (${o.shippingMethod})` : ""}: ${o.shippingPaise === 0 ? "Free" : formatInr(o.shippingPaise)}`,
    `Total (incl. GST): ${formatInr(o.totalPaise)}`,
  ].join("\n");

const address = (o: Order) =>
  [o.shipName, o.shipLine1, o.shipLine2, `${o.shipCity}, ${o.shipState} ${o.shipPincode}`, o.shipCountry].filter(Boolean) as string[];

/* ── Customer emails ──────────────────────────────────────────────────── */

export function orderConfirmation(o: OrderWithItems, store: Store): Email {
  const cod = o.paymentMethod === "COD";
  const payLine = cod
    ? `You'll pay <strong>${formatInr(o.totalPaise)}</strong> in cash when your order arrives.`
    : `Payment: ${esc(METHOD[o.paymentMethod ?? ""] ?? "online")}.`;
  const delivery = o.shippingMethod ? `${esc(o.shippingMethod)}${o.shippingEta ? ` · ${esc(o.shippingEta)}` : ""}` : "";

  const html = layout(
    store,
    `We've received your order #${o.number}.`,
    [
      h1(`Thank you, ${esc(firstName(o.shipName))}!`),
      p(`We've received your order <strong>#${esc(o.number)}</strong> and we're getting it ready.`),
      p(payLine),
      heading("Your order"),
      itemsTable(o),
      heading("Delivering to"),
      p(address(o).map(esc).join("<br>") + (delivery ? `<br><span style="color:${SOFT}">${delivery}</span>` : "")),
      button(trackUrl(o), "Track your order"),
      p(`<span style="color:${SOFT};font-size:12px">Track it any time with your order number and this email address.</span>`),
    ].join(""),
  );

  const text = [
    `Thank you, ${firstName(o.shipName)}!`,
    `We've received your order #${o.number}.`,
    cod ? `You'll pay ${formatInr(o.totalPaise)} in cash when your order arrives.` : "",
    "",
    itemsText(o),
    "",
    "Delivering to:",
    ...address(o),
    o.shippingMethod ? `${o.shippingMethod}${o.shippingEta ? ` - ${o.shippingEta}` : ""}` : "",
    "",
    `Track your order: ${trackUrl(o)}`,
  ].join("\n");

  return {
    to: o.email,
    subject: `Your ${store.name} order #${o.number}`,
    html,
    text,
    kind: "order.confirmation",
    orderId: o.id,
    replyTo: store.supportEmail || undefined,
  };
}

/** Statuses a customer hears about, and what we tell them. */
const STATUS_MAIL: Partial<Record<OrderStatus, { subject: string; title: string; line: (o: Order) => string }>> = {
  SHIPPED: {
    subject: "is on its way",
    title: "Your order has shipped",
    line: (o) =>
      `Good news — order <strong>#${esc(o.number)}</strong> has left us and is with the courier${o.shippingEta ? ` (${esc(o.shippingEta)})` : ""}.`,
  },
  OUT_FOR_DELIVERY: {
    subject: "is out for delivery",
    title: "Arriving today",
    line: (o) =>
      `Order <strong>#${esc(o.number)}</strong> is out for delivery and should reach you today.${o.paymentMethod === "COD" ? ` Please keep <strong>${formatInr(o.totalPaise)}</strong> ready in cash.` : ""}`,
  },
  DELIVERED: {
    subject: "has been delivered",
    title: "Delivered",
    line: (o) => `Order <strong>#${esc(o.number)}</strong> has been delivered. We hope you love it!`,
  },
  CANCELLED: {
    subject: "has been cancelled",
    title: "Your order was cancelled",
    line: (o) =>
      `Order <strong>#${esc(o.number)}</strong> has been cancelled.${o.paymentStatus === "PAID" ? " Your refund is on its way to your original payment method." : " You haven't been charged."} If you didn't expect this, just reply to this email.`,
  },
  REFUNDED: {
    subject: "has been refunded",
    title: "Refund issued",
    line: (o) =>
      `We've refunded <strong>${formatInr(o.totalPaise)}</strong> for order <strong>#${esc(o.number)}</strong>. It usually reaches your account in 5–7 business days.`,
  },
};

export const customerHearsAbout = (status: OrderStatus) => status in STATUS_MAIL;

export function orderStatusUpdate(o: Order, status: OrderStatus, note: string | undefined, store: Store): Email | null {
  const m = STATUS_MAIL[status];
  if (!m) return null;
  const noteHtml = note
    ? `<p style="margin:0 0 14px;padding:12px 14px;background:#fcf6f2;border-left:3px solid #c1883e">${escLines(note)}</p>`
    : "";
  // Who has the parcel and under what number, once that's been filled in.
  const courier = o.courierName ? esc(o.courierName) : "the courier";
  const trackingHtml = o.trackingNumber
    ? p(
        `Carried by <strong>${courier}</strong>, tracking number <strong>${esc(o.trackingNumber)}</strong>.${
          o.trackingUrl ? ` <a href="${esc(o.trackingUrl)}" style="color:#8a5a26">Follow it on their site</a>.` : ""
        }`,
      )
    : "";
  const trackingText = o.trackingNumber
    ? `\n${o.courierName ?? "Courier"} tracking number: ${o.trackingNumber}${o.trackingUrl ? `\n${o.trackingUrl}` : ""}`
    : "";
  const html = layout(
    store,
    `Order #${o.number} ${m.subject}.`,
    [h1(esc(m.title)), p(m.line(o)), trackingHtml, noteHtml, button(trackUrl(o), "Track your order")].join(""),
  );
  const text = [
    m.title,
    m.line(o).replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#39;/g, "'"),
    trackingText,
    note ? `\nNote from our team: ${note}` : "",
    "",
    `Track your order: ${trackUrl(o)}`,
  ].join("\n");
  return {
    to: o.email,
    subject: `Your ${store.name} order #${o.number} ${m.subject}`,
    html,
    text,
    kind: "order.status",
    orderId: o.id,
    replyTo: store.supportEmail || undefined,
  };
}

/* ── Team alerts ──────────────────────────────────────────────────────── */

export function alertNewOrder(o: OrderWithItems, store: Store, to: string): Email {
  const link = `${env.ADMIN_URL}/orders/${encodeURIComponent(o.number)}`;
  const html = layout(
    store,
    `New order #${o.number}.`,
    [
      h1(`New order #${esc(o.number)}`),
      p(
        `<strong>${esc(o.shipName)}</strong> · <a href="mailto:${esc(o.email)}" style="color:#8a5a26">${esc(o.email)}</a> · ${esc(o.shipPhone)}<br>${esc(o.shipCity)}, ${esc(o.shipState)} · ${esc(METHOD[o.paymentMethod ?? ""] ?? "")}${o.shippingMethod ? ` · ${esc(o.shippingMethod)}` : ""}`,
      ),
      itemsTable(o),
      button(link, "Open in admin"),
    ].join(""),
  );
  const text = [`New order #${o.number}`, `${o.shipName} <${o.email}> ${o.shipPhone}`, `${o.shipCity}, ${o.shipState}`, "", itemsText(o), "", link].join("\n");
  return {
    to,
    subject: `New order #${o.number} — ${formatInr(o.totalPaise)}${o.paymentMethod === "COD" ? " (COD)" : ""}`,
    html,
    text,
    kind: "alert.order",
    orderId: o.id,
    replyTo: o.email,
  };
}

export function alertContactMessage(
  m: { name: string; email: string; phone?: string | null; subject: string; message: string },
  store: Store,
  to: string,
): Email {
  const link = `${env.ADMIN_URL}/inbox`;
  const html = layout(
    store,
    `${m.name}: ${m.subject}`,
    [
      h1("New message"),
      p(
        `<strong>${esc(m.name)}</strong> · <a href="mailto:${esc(m.email)}" style="color:#8a5a26">${esc(m.email)}</a>${m.phone ? ` · ${esc(m.phone)}` : ""}`,
      ),
      heading(esc(m.subject)),
      `<p style="margin:0 0 14px;padding:12px 14px;background:#fcf6f2">${escLines(m.message)}</p>`,
      p(`<span style="color:${SOFT};font-size:12px">Reply to this email to answer ${esc(firstName(m.name))} directly.</span>`),
      button(link, "Open the inbox"),
    ].join(""),
  );
  const text = [`New message from ${m.name} <${m.email}>${m.phone ? ` ${m.phone}` : ""}`, `Subject: ${m.subject}`, "", m.message, "", link].join("\n");
  return { to, subject: `New message: ${m.subject}`, html, text, kind: "alert.message", replyTo: m.email };
}

export function alertCollabApplication(
  a: { name: string; email: string; handle: string; audienceSize?: string | null; about: string },
  store: Store,
  to: string,
): Email {
  const link = `${env.ADMIN_URL}/inbox?tab=applications`;
  const html = layout(
    store,
    `${a.name} (${a.handle}) wants to collaborate.`,
    [
      h1("New collab application"),
      p(
        `<strong>${esc(a.name)}</strong> · ${esc(a.handle)}${a.audienceSize ? ` · ${esc(a.audienceSize)} audience` : ""}<br><a href="mailto:${esc(a.email)}" style="color:#8a5a26">${esc(a.email)}</a>`,
      ),
      `<p style="margin:0 0 14px;padding:12px 14px;background:#fcf6f2">${escLines(a.about)}</p>`,
      button(link, "Open the inbox"),
    ].join(""),
  );
  const text = [`New collab application from ${a.name} (${a.handle}) <${a.email}>`, a.audienceSize ? `Audience: ${a.audienceSize}` : "", "", a.about, "", link].join("\n");
  return { to, subject: `New collab application: ${a.handle}`, html, text, kind: "alert.collab", replyTo: a.email };
}

export function testEmail(store: Store, to: string): Email {
  const html = layout(
    store,
    "Test email from your store.",
    [
      h1("It works"),
      p(`This is a test email from the ${esc(store.name)} admin. If it reached your inbox, order emails will too.`),
    ].join(""),
  );
  return {
    to,
    subject: `Test email from ${store.name}`,
    html,
    text: `This is a test email from the ${store.name} admin. If it reached your inbox, order emails will too.`,
    kind: "test",
  };
}

/* ── Account emails ───────────────────────────────────────────────────── */

export function verifyEmail(c: { name: string; email: string }, token: string, store: Store): Email {
  const link = `${env.STORE_URL}/account/verify?token=${encodeURIComponent(token)}`;
  const html = layout(
    store,
    "Confirm your email to see your orders.",
    [
      h1(`Welcome, ${esc(firstName(c.name))}!`),
      p(`Please confirm this is your email address. Once you do, your order history appears in your account — including any orders you placed before signing up.`),
      button(link, "Confirm my email"),
      p(`<span style="color:${SOFT};font-size:12px">This link works once and expires in 48 hours. If you didn't create a ${esc(store.name)} account, you can ignore this email.</span>`),
    ].join(""),
  );
  const text = [
    `Welcome, ${firstName(c.name)}!`,
    "Confirm your email address to see your order history:",
    link,
    "",
    `This link works once and expires in 48 hours. If you didn't create a ${store.name} account, ignore this email.`,
  ].join("\n");
  return { to: c.email, subject: `Confirm your email for ${store.name}`, html, text, kind: "account.verify", replyTo: store.supportEmail || undefined };
}

export function passwordResetEmail(c: { name: string; email: string }, token: string, store: Store): Email {
  const link = `${env.STORE_URL}/account/reset?token=${encodeURIComponent(token)}`;
  const html = layout(
    store,
    "Reset your password.",
    [
      h1("Reset your password"),
      p(`Hi ${esc(firstName(c.name))}, someone (hopefully you) asked to reset the password for your ${esc(store.name)} account.`),
      button(link, "Choose a new password"),
      p(`<span style="color:${SOFT};font-size:12px">This link works once and expires in 1 hour. If you didn't ask for this, ignore this email — your password won't change.</span>`),
    ].join(""),
  );
  const text = [
    `Hi ${firstName(c.name)},`,
    `Reset your ${store.name} password here:`,
    link,
    "",
    "This link works once and expires in 1 hour. If you didn't ask for this, ignore this email.",
  ].join("\n");
  return { to: c.email, subject: `Reset your ${store.name} password`, html, text, kind: "account.reset", replyTo: store.supportEmail || undefined };
}

/* ── Returns ──────────────────────────────────────────────────────────── */

type ReturnMail = {
  number: string;
  status: ReturnStatus;
  reason: ReturnReason;
  /** The customer's own words, shown to the team. */
  note: string | null;
  staffNote: string | null;
  refundPaise: number | null;
  /** The GST credit note issued with the refund, if the order had an invoice. */
  creditNote?: string | null;
  items: { productName: string; shadeName: string | null; quantity: number }[];
};

export const RETURN_REASON_LABEL: Record<ReturnReason, string> = {
  DAMAGED: "Arrived damaged",
  WRONG_ITEM: "Wrong item sent",
  NOT_AS_DESCRIBED: "Not as described",
  REACTION: "Caused a reaction",
  CHANGED_MIND: "Changed their mind",
  OTHER: "Something else",
};

const RETURN_MAIL: Partial<Record<ReturnStatus, { subject: string; title: string; line: (r: ReturnMail, o: Order) => string }>> = {
  APPROVED: {
    subject: "is approved",
    title: "Your return is approved",
    line: (r, o) =>
      `We've approved the return for order <strong>#${esc(o.number)}</strong>. Send the items back unused and in their original packaging — we'll email the pickup or courier details next.`,
  },
  REJECTED: {
    subject: "couldn't be accepted",
    title: "About your return request",
    line: (r, o) =>
      `We're sorry — we can't accept the return for order <strong>#${esc(o.number)}</strong>. The note below explains why, and you can reply to this email if anything looks wrong.`,
  },
  RECEIVED: {
    subject: "has arrived with us",
    title: "We've received your return",
    line: (r, o) =>
      `Your parcel for order <strong>#${esc(o.number)}</strong> is back with us and being checked. The refund follows shortly.`,
  },
  REFUNDED: {
    subject: "has been refunded",
    title: "Your refund is on its way",
    line: (r, o) =>
      `We've refunded ${r.refundPaise != null ? `<strong>${formatInr(r.refundPaise)}</strong>` : "your return"} for order <strong>#${esc(o.number)}</strong>. Bank transfers usually take 3–5 working days to appear.${
        r.creditNote ? ` Credit note <strong>${esc(r.creditNote)}</strong>, which reduces your invoice, is with your order.` : ""
      }`,
  },
};

/** Whether the customer hears about a return reaching this state. */
export const customerHearsAboutReturn = (status: ReturnStatus) => status in RETURN_MAIL;

export function returnUpdate(r: ReturnMail, o: Order, store: Store): Email | null {
  const m = RETURN_MAIL[r.status];
  if (!m) return null;
  const noteHtml = r.staffNote
    ? `<p style="margin:0 0 14px;padding:12px 14px;background:#fcf6f2;border-left:3px solid #c1883e">${escLines(r.staffNote)}</p>`
    : "";
  const list = r.items
    .map((i) => `${esc(i.productName)}${i.shadeName ? ` — ${esc(i.shadeName)}` : ""} × ${i.quantity}`)
    .join("<br>");
  const html = layout(
    store,
    `Return ${esc(r.number)} ${m.subject}.`,
    [h1(esc(m.title)), p(m.line(r, o)), noteHtml, heading("Items"), p(list), button(trackUrl(o), "View your order")].join(""),
  );
  const text = [
    m.title,
    m.line(r, o).replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#39;/g, "'"),
    r.staffNote ? `\nNote from our team: ${r.staffNote}` : "",
    "",
    "Items:",
    ...r.items.map((i) => `- ${i.productName}${i.shadeName ? ` — ${i.shadeName}` : ""} x ${i.quantity}`),
    "",
    `View your order: ${trackUrl(o)}`,
  ].join("\n");
  return {
    to: o.email,
    subject: `Your ${store.name} return ${r.number} ${m.subject}`,
    html,
    text,
    kind: "return.update",
    orderId: o.id,
    replyTo: store.supportEmail || undefined,
  };
}

export function alertReturnRequest(r: ReturnMail, o: Order, store: Store, to: string): Email {
  const link = `${env.ADMIN_URL}/returns`;
  const list = r.items
    .map((i) => `${esc(i.productName)}${i.shadeName ? ` — ${esc(i.shadeName)}` : ""} × ${i.quantity}`)
    .join("<br>");
  const html = layout(
    store,
    `Return requested for #${esc(o.number)}.`,
    [
      h1(`Return requested — ${esc(r.number)}`),
      p(
        `<strong>${esc(o.shipName)}</strong> · <a href="mailto:${esc(o.email)}" style="color:#8a5a26">${esc(o.email)}</a><br>Order #${esc(o.number)} · ${esc(RETURN_REASON_LABEL[r.reason])}`,
      ),
      r.note ? `<p style="margin:0 0 14px;padding:12px 14px;background:#fcf6f2;border-left:3px solid #c1883e">${escLines(r.note)}</p>` : "",
      heading("Items"),
      p(list),
      button(link, "Open in admin"),
    ].join(""),
  );
  const text = [
    `Return requested — ${r.number}`,
    `${o.shipName} <${o.email}> · order #${o.number}`,
    RETURN_REASON_LABEL[r.reason],
    r.note ? `\n"${r.note}"` : "",
    "",
    ...r.items.map((i) => `- ${i.productName}${i.shadeName ? ` — ${i.shadeName}` : ""} x ${i.quantity}`),
    "",
    link,
  ].join("\n");
  return {
    to,
    subject: `Return requested for #${o.number} — ${RETURN_REASON_LABEL[r.reason]}`,
    html,
    text,
    kind: "alert.return",
    orderId: o.id,
    replyTo: o.email,
  };
}
