import { prisma } from "../db.js";
import { env, isProd } from "../env.js";

export type Email = {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** order.confirmation, order.status, alert.order, alert.message, alert.collab, test */
  kind: string;
  orderId?: string;
  replyTo?: string;
};

/**
 * Addresses reserved for examples and tests (RFC 2606 / 6761). Never really
 * emailed — so the smoke suite and demo data can't bounce mail off a real
 * provider and damage the sending domain's reputation.
 */
const RESERVED = /@(?:[^@]+\.)?(?:example\.(?:com|net|org)|[^@.]+\.(?:test|example|invalid|localhost))$/i;

export const emailServiceConnected = () => Boolean(env.RESEND_API_KEY);

/**
 * Emails whose body carries a one-time link that signs someone in: confirming
 * an email address, and resetting a password.
 */
const ONE_TIME_LINK = new Set(["account.verify", "account.reset"]);

/**
 * The copy kept in the admin's Email Log has those links taken out. Anyone
 * who can read the log — a Support Agent, say — would otherwise be able to
 * open a customer's reset link and take over their account.
 *
 * Addresses reserved for tests keep theirs: nothing is ever delivered to
 * them, so the suite has no other way to follow the link, and the account is
 * the tester's own.
 */
function forTheLog(email: Email) {
  if (!ONE_TIME_LINK.has(email.kind) || RESERVED.test(email.to)) return email;
  const strip = (text: string) => text.replace(/([?&]token=)[A-Za-z0-9_-]+/g, "$1removed");
  return { ...email, html: strip(email.html), text: strip(email.text) };
}

/**
 * Sends one email and records it in the Email Log, whatever happens. Without
 * RESEND_API_KEY (or for a test address) the email is only recorded, as
 * "captured", so the admin can still read exactly what would have gone out.
 * Never throws.
 */
export async function sendEmail(email: Email) {
  let status: "SENT" | "FAILED" | "CAPTURED";
  let detail: string | null = null;
  let providerId: string | null = null;

  if (!env.RESEND_API_KEY) {
    status = "CAPTURED";
    detail = "Not sent — no email service is connected yet (RESEND_API_KEY)";
  } else if (RESERVED.test(email.to)) {
    status = "CAPTURED";
    detail = "Not sent — test address";
  } else {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
        body: JSON.stringify({
          from: env.EMAIL_FROM,
          to: [email.to],
          subject: email.subject,
          html: email.html,
          text: email.text,
          ...(email.replyTo ? { reply_to: email.replyTo } : {}),
        }),
        signal: AbortSignal.timeout(10_000),
      });
      const body = (await res.json().catch(() => null)) as { id?: string; message?: string } | null;
      if (res.ok) {
        status = "SENT";
        providerId = body?.id ?? null;
      } else {
        status = "FAILED";
        detail = body?.message ?? `Email service answered ${res.status}`;
      }
    } catch (err) {
      status = "FAILED";
      detail = `Couldn't reach the email service: ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  try {
    const logged = forTheLog(email);
    await prisma.emailLog.create({
      data: {
        to: logged.to,
        subject: logged.subject,
        kind: logged.kind,
        status,
        detail,
        providerId,
        html: logged.html,
        orderId: logged.orderId,
      },
    });
  } catch (err) {
    console.error("email log write failed:", err);
  }

  if (status === "FAILED") console.error(`✉ ${email.kind} to ${email.to} failed: ${detail}`);
  else if (!isProd && status === "CAPTURED") console.log(`✉ captured ${email.kind} → ${email.to}: ${email.subject}`);
  return status;
}

/**
 * Builds and sends emails after the current request has been answered.
 * Email is never allowed to slow down, fail or roll back the action that
 * triggered it — an order is placed whether or not its confirmation sends.
 */
export function afterResponse(build: () => Promise<Email[]>) {
  setImmediate(() => {
    build()
      .then((emails) => Promise.all(emails.map(sendEmail)))
      .catch((err) => console.error("preparing email failed:", err));
  });
}
