"use client";

import { api } from "./api/client";
import type { PaymentHandoff } from "./api/types";

/**
 * Razorpay Checkout, from the shopper's side.
 *
 * The order already exists and holds its stock; this collects the money for
 * it. Razorpay hands back a payment id and a signature, which only the API can
 * check (the key secret never leaves the server), so nothing here decides
 * whether an order is paid — it only carries the gateway's answer over.
 */

const SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

type RazorpayResult = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = { open: () => void; on: (event: string, handler: (e: unknown) => void) => void };

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

function loadScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("load")));
      return;
    }
    const tag = document.createElement("script");
    tag.src = SCRIPT;
    tag.async = true;
    tag.onload = () => resolve();
    tag.onerror = () => reject(new Error("load"));
    document.body.appendChild(tag);
  });
}

export type PaymentOutcome =
  | { status: "paid" }
  /** They closed the window, or the payment didn't go through. */
  | { status: "unpaid"; message: string };

/** Tells the API about a completed payment, which verifies it and confirms the order. */
async function reportPayment(orderNumber: string, paymentId: string, signature: string) {
  await api("POST", `/orders/${encodeURIComponent(orderNumber)}/payment`, { paymentId, signature });
}

/**
 * Opens Razorpay for an order and settles it. In development without keys the
 * API marks the payment as the gateway would, so the rest of the path is the
 * same one that runs live.
 */
export async function payForOrder(
  orderNumber: string,
  payment: PaymentHandoff,
  store: { name: string; supportEmail: string },
): Promise<PaymentOutcome> {
  if (payment.simulated) {
    const proof = await api<{ paymentId: string; signature: string }>(
      "POST",
      `/orders/${encodeURIComponent(orderNumber)}/payment/simulate`,
    );
    await reportPayment(orderNumber, proof.paymentId, proof.signature);
    return { status: "paid" };
  }

  try {
    await loadScript();
  } catch {
    return { status: "unpaid", message: "We couldn't open the payment window. Check your connection and try again." };
  }
  const Razorpay = window.Razorpay;
  if (!Razorpay) {
    return { status: "unpaid", message: "We couldn't open the payment window. Please try again." };
  }

  return new Promise<PaymentOutcome>((resolve) => {
    let settled = false;
    const finish = (outcome: PaymentOutcome) => {
      if (!settled) {
        settled = true;
        resolve(outcome);
      }
    };

    const checkout = new Razorpay({
      key: payment.keyId,
      order_id: payment.gatewayOrderId,
      amount: payment.amountPaise,
      currency: "INR",
      name: store.name,
      description: `Order ${orderNumber}`,
      image: "/brand/logo-mark.png",
      prefill: payment.prefill,
      notes: { order: orderNumber },
      theme: { color: "#2a122b" },
      handler: (result: RazorpayResult) => {
        reportPayment(orderNumber, result.razorpay_payment_id, result.razorpay_signature)
          .then(() => finish({ status: "paid" }))
          .catch((err: Error) =>
            finish({
              status: "unpaid",
              // The money may well have left their account; never imply it hasn't.
              message: `${err.message} If your account has been charged, email ${store.supportEmail} with order ${orderNumber} and we'll sort it out.`,
            }),
          );
      },
      modal: {
        ondismiss: () =>
          finish({ status: "unpaid", message: "Payment wasn't completed. Your order is held for 30 minutes — you can try again." }),
      },
    });

    checkout.on("payment.failed", (event: unknown) => {
      const reason = (event as { error?: { description?: string } })?.error?.description;
      finish({ status: "unpaid", message: reason ? `Payment failed: ${reason}` : "Payment failed. You can try again." });
    });

    checkout.open();
  });
}
