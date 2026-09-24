import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { env, isProd } from "../env.js";
import { conflict, HttpError } from "./http.js";

/**
 * Razorpay, the payment gateway.
 *
 * The flow is Razorpay's standard one: the API creates a gateway order, the
 * browser opens Razorpay Checkout with it, and the gateway hands back a
 * payment id and a signature that only someone holding the key secret could
 * have produced. We verify that signature before a rupee is credited to the
 * order, and the webhook repeats the same check from the other direction so a
 * closed browser tab can't lose a paid order.
 *
 * Keys live in the environment, never in the database or the admin screen.
 *
 * WITHOUT KEYS, in development only, a simulator stands in: it issues
 * fake ids and signs them with a fixed local secret, so the whole path can be
 * exercised (and smoke-tested) before there's a Razorpay account. It refuses
 * to run in production — see `simulating`.
 */

const SIMULATOR_SECRET = "razorpay-simulator-not-a-real-key";
const API = "https://api.razorpay.com/v1";

/**
 * True when the API stands in for the gateway. Switched on deliberately with
 * ALLOW_PAYMENT_SIMULATOR=true, which the environment refuses to accept in
 * production or against a database that isn't local (see env.ts), so it can't
 * be reached by a misconfigured deploy.
 */
export const simulating = env.ALLOW_PAYMENT_SIMULATOR && !env.RAZORPAY_KEY_ID && !isProd;

export type GatewayStatus = {
  /** Whether online payment can be taken at all. */
  connected: boolean;
  /** "test" or "live" from the key's own prefix; "simulated" in development. */
  mode: "test" | "live" | "simulated" | null;
  /** Safe to send to the browser — Razorpay Checkout needs it. */
  keyId: string | null;
  /** Whether webhooks are signed; without it we ignore them. */
  webhookReady: boolean;
};

export function gatewayStatus(): GatewayStatus {
  if (env.RAZORPAY_KEY_ID) {
    return {
      connected: true,
      mode: env.RAZORPAY_KEY_ID.startsWith("rzp_live_") ? "live" : "test",
      keyId: env.RAZORPAY_KEY_ID,
      webhookReady: Boolean(env.RAZORPAY_WEBHOOK_SECRET),
    };
  }
  return simulating
    ? { connected: true, mode: "simulated", keyId: "rzp_test_simulated", webhookReady: true }
    : { connected: false, mode: null, keyId: null, webhookReady: false };
}

const secret = () => env.RAZORPAY_KEY_SECRET ?? SIMULATOR_SECRET;

/** Razorpay signs `${orderId}|${paymentId}` with the key secret. */
export const paymentSignature = (gatewayOrderId: string, paymentId: string) =>
  createHmac("sha256", secret()).update(`${gatewayOrderId}|${paymentId}`).digest("hex");

const sameSignature = (a: string, b: string) => {
  const one = Buffer.from(a, "utf8");
  const two = Buffer.from(b, "utf8");
  return one.length === two.length && timingSafeEqual(one, two);
};

export const verifyPaymentSignature = (gatewayOrderId: string, paymentId: string, signature: string) =>
  sameSignature(paymentSignature(gatewayOrderId, paymentId), signature);

/** Webhooks are signed over the raw body with their own secret. */
export function verifyWebhookSignature(rawBody: Buffer | string, signature: string) {
  const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET ?? (simulating ? SIMULATOR_SECRET : null);
  if (!webhookSecret) return false;
  const expected = createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  return sameSignature(expected, signature);
}

/* ── Talking to Razorpay ── */

async function call<T>(path: string, body: unknown): Promise<T> {
  const auth = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString("base64");
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Basic ${auth}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    });
  } catch (cause) {
    throw new HttpError(502, "GATEWAY_UNREACHABLE", "Couldn't reach Razorpay — please try again", { cause });
  }
  const json = (await res.json().catch(() => null)) as { error?: { description?: string } } | T;
  if (!res.ok) {
    const description = (json as { error?: { description?: string } })?.error?.description;
    throw new HttpError(502, "GATEWAY_ERROR", description ?? `Razorpay refused the request (${res.status})`);
  }
  return json as T;
}

/**
 * The gateway's own order, which the browser pays against. `receipt` carries
 * our order number so a payment can always be traced back.
 */
export async function createGatewayOrder(input: { amountPaise: number; receipt: string; email: string }) {
  if (simulating) return { id: `order_sim${randomBytes(9).toString("hex")}` };
  if (!env.RAZORPAY_KEY_ID) throw conflict("Online payment isn't switched on");
  return call<{ id: string }>("/orders", {
    amount: input.amountPaise,
    currency: "INR",
    receipt: input.receipt.slice(0, 40),
    notes: { order: input.receipt, email: input.email },
  });
}

/**
 * Whether an order's money can be sent back through the gateway: it was paid
 * online, we know which payment, and Razorpay is reachable. Cash on delivery
 * is refunded by hand, so it answers false.
 */
export const refundableOnline = (order: { paymentStatus: string; razorpayPaymentId: string | null }) =>
  order.paymentStatus === "PAID" && Boolean(order.razorpayPaymentId) && gatewayStatus().connected;

/** Sends money back for a payment. Amount in paise; partial refunds are fine. */
export async function refundPayment(paymentId: string, amountPaise: number, notes: Record<string, string>) {
  if (simulating) return { id: `rfnd_sim${randomBytes(9).toString("hex")}` };
  if (!env.RAZORPAY_KEY_ID) throw conflict("Online payment isn't switched on");
  return call<{ id: string }>(`/payments/${encodeURIComponent(paymentId)}/refund`, {
    amount: amountPaise,
    speed: "normal",
    notes,
  });
}
