import { Router } from "express";
import { prisma } from "../../db.js";
import { afterResponse } from "../../lib/mail.js";
import { verifyWebhookSignature } from "../../lib/payments.js";
import { markPaid, orderEmails, recordLatePayment } from "./checkout.js";

/**
 * Razorpay's side of the conversation. The browser usually tells us about a
 * payment first, but a shopper who closes the tab on the way back never does —
 * so the gateway repeats it here, signed with the webhook secret.
 *
 * Everything is answered 200 once the signature checks out, including events
 * we don't act on: a gateway that thinks delivery failed keeps retrying.
 */
export const webhooksRouter = Router();

webhooksRouter.post("/webhooks/razorpay", async (req, res) => {
  const signature = req.header("x-razorpay-signature") ?? "";
  const raw = req.rawBody ?? Buffer.from(JSON.stringify(req.body ?? {}));
  if (!signature || !verifyWebhookSignature(raw, signature)) {
    res.status(400).json({ error: { code: "BAD_SIGNATURE", message: "Signature mismatch" } });
    return;
  }

  const event = req.body as {
    event?: string;
    payload?: { payment?: { entity?: { id?: string; order_id?: string; error_description?: string } } };
  };
  const payment = event.payload?.payment?.entity;
  if (!payment?.order_id || !payment.id) {
    res.json({ data: { handled: false } });
    return;
  }

  const order = await prisma.order.findFirst({
    where: { razorpayOrderId: payment.order_id },
    select: { id: true, paymentStatus: true, status: true },
  });
  if (!order) {
    res.json({ data: { handled: false } });
    return;
  }

  if (event.event === "payment.captured" || event.event === "order.paid") {
    const { applied, late } = await markPaid(order.id, payment.id);
    // Only the first word of a payment sends the emails; the gateway may
    // deliver the same event more than once.
    if (applied) afterResponse(() => orderEmails(order.id));
    // Money for an order that was cancelled or already refunded: left alone,
    // and the team is told so it can be sent back.
    if (late) await recordLatePayment(order.id, payment.id);
    res.json({ data: { handled: applied } });
    return;
  }

  if (event.event === "payment.failed" && order.status === "PENDING") {
    await prisma.orderEvent.create({
      data: {
        orderId: order.id,
        status: "PENDING",
        note: `Payment failed${payment.error_description ? `: ${payment.error_description}` : ""}`,
      },
    });
    res.json({ data: { handled: true } });
    return;
  }

  res.json({ data: { handled: false } });
});
