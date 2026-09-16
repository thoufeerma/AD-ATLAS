"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Lock, ChevronLeft, Truck, ShoppingBag } from "lucide-react";
import Button from "@/components/ui/Button";
import { useStore, useHydrated, resolveLines, cartTotals } from "@/lib/store";
import { inr, cn } from "@/lib/utils";
import { STORE } from "@/lib/products";

/**
 * No full checkout design exists in the reference set — only the small
 * Shipping / Payment / Review thumbnail on web-page-design-Passed-01.png.
 * This follows that three-step structure, styled to match M-Cart.
 *
 * Razorpay is not wired up yet: PAY_METHODS mirrors what Razorpay Checkout
 * will offer (UPI, cards, netbanking, wallets) plus COD, and placing an order
 * currently just clears the cart and routes to the success page. The real
 * integration lands in the backend phase.
 */
const STEPS = ["Shipping", "Payment", "Review"] as const;
type Step = (typeof STEPS)[number];

const PAY_METHODS = [
  { id: "upi", label: "UPI", note: "Google Pay, PhonePe, Paytm & more" },
  { id: "card", label: "Credit / Debit Card", note: "Visa, Mastercard, RuPay, Amex" },
  { id: "netbanking", label: "Net Banking", note: "All major Indian banks" },
  { id: "wallet", label: "Wallets", note: "Paytm, Amazon Pay, Mobikwik" },
  { id: "cod", label: "Cash on Delivery", note: "Pay when your order arrives" },
];

/** Placeholder until the backend issues real order numbers. */
function makeOrderId() {
  return `VL${Date.now().toString().slice(-8)}`;
}

type Address = {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

const EMPTY: Address = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

export default function CheckoutFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("Shipping");
  const [addr, setAddr] = useState<Address>(EMPTY);
  const [method, setMethod] = useState("upi");
  const [placing, setPlacing] = useState(false);

  const hydrated = useHydrated();
  const lines = useStore((s) => s.lines);
  const coupon = useStore((s) => s.coupon);
  const clear = useStore((s) => s.clear);

  const resolved = resolveLines(lines);
  const t = cartTotals(resolved, coupon);

  if (!hydrated) return <div className="container-vel py-20" aria-hidden />;

  if (resolved.length === 0) {
    return (
      <div className="container-vel py-20 text-center">
        <ShoppingBag className="mx-auto size-10 text-gold-500" />
        <h2 className="mt-5 font-display text-2xl text-plum-800">Nothing to check out</h2>
        <p className="mt-2 text-sm text-ink-soft">Your cart is empty.</p>
        <Button href="/shop" className="mt-7">
          Continue Shopping
        </Button>
      </div>
    );
  }

  const shippingValid =
    addr.fullName.trim() !== "" &&
    /^\d{10}$/.test(addr.phone.replace(/\D/g, "")) &&
    /\S+@\S+\.\S+/.test(addr.email) &&
    addr.address.trim() !== "" &&
    addr.city.trim() !== "" &&
    addr.state.trim() !== "" &&
    /^\d{6}$/.test(addr.pincode);

  function placeOrder() {
    setPlacing(true);
    // Stands in for the Razorpay order + payment handshake.
    const orderId = makeOrderId();
    try {
      sessionStorage.setItem(
        "velastia-last-order",
        JSON.stringify({
          orderId,
          placedAt: new Date().toISOString(),
          addr,
          method,
          lines: resolved,
          totals: t,
        }),
      );
    } catch {
      // sessionStorage can throw in private modes; the success page has defaults.
    }
    clear();
    router.push(`/order-success?order=${orderId}`);
  }

  const stepIndex = STEPS.indexOf(step);

  return (
    <div className="container-vel py-10">
      {/* Stepper */}
      <ol className="mx-auto mb-10 flex max-w-xl items-center">
        {STEPS.map((s, i) => {
          const done = i < stepIndex;
          const active = i === stepIndex;
          return (
            <li key={s} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "grid size-8 place-items-center rounded-full text-[0.7rem] transition-colors",
                    done || active
                      ? "bg-plum-800 text-gold-300"
                      : "border border-gold-300 text-ink-soft",
                  )}
                >
                  {done ? <Check className="size-3.5" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "label-caps text-[0.62rem]",
                    active ? "text-plum-800" : "text-ink-soft",
                  )}
                >
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span
                  className={cn(
                    "mx-3 h-px flex-1",
                    done ? "bg-gold-500" : "bg-gold-200",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-6 sm:p-8">
          {step === "Shipping" && (
            <>
              <h2 className="font-display text-xl text-plum-800">Shipping Details</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Full Name"
                  value={addr.fullName}
                  onChange={(v) => setAddr({ ...addr, fullName: v })}
                  placeholder="Ananya Sharma"
                />
                <Field
                  label="Phone Number"
                  value={addr.phone}
                  onChange={(v) => setAddr({ ...addr, phone: v })}
                  placeholder="98765 43210"
                  inputMode="numeric"
                />
                <Field
                  label="Email Address"
                  value={addr.email}
                  onChange={(v) => setAddr({ ...addr, email: v })}
                  placeholder="you@example.com"
                  type="email"
                  className="sm:col-span-2"
                />
                <Field
                  label="Address"
                  value={addr.address}
                  onChange={(v) => setAddr({ ...addr, address: v })}
                  placeholder="123, Lotus Residency, MG Road, Andheri West"
                  className="sm:col-span-2"
                />
                <Field
                  label="City"
                  value={addr.city}
                  onChange={(v) => setAddr({ ...addr, city: v })}
                  placeholder="Mumbai"
                />
                <Field
                  label="State"
                  value={addr.state}
                  onChange={(v) => setAddr({ ...addr, state: v })}
                  placeholder="Maharashtra"
                />
                <Field
                  label="Pincode"
                  value={addr.pincode}
                  onChange={(v) => setAddr({ ...addr, pincode: v })}
                  placeholder="400053"
                  inputMode="numeric"
                />
              </div>

              <div className="mt-6 flex items-center gap-3 rounded-sm bg-blush-100 px-4 py-3">
                <Truck className="size-4 shrink-0 text-gold-600" />
                <p className="text-[0.72rem] text-ink-soft">
                  Standard shipping, 3–5 business days.{" "}
                  {t.shipping === 0
                    ? "Free on this order."
                    : `${inr(t.shipping)} — add ${inr(STORE.freeShippingAbove - t.subtotal)} more for free shipping.`}
                </p>
              </div>

              <Button
                className="mt-7 w-full sm:w-auto"
                size="lg"
                disabled={!shippingValid}
                onClick={() => setStep("Payment")}
              >
                Continue to Payment
              </Button>
              {!shippingValid && (
                <p className="mt-2.5 text-[0.68rem] text-ink-soft">
                  Enter a 10-digit phone, a valid email and a 6-digit pincode to continue.
                </p>
              )}
            </>
          )}

          {step === "Payment" && (
            <>
              <h2 className="font-display text-xl text-plum-800">Payment Method</h2>
              <p className="mt-1 text-[0.72rem] text-ink-soft">
                Processed securely through Razorpay.
              </p>

              <ul className="mt-6 space-y-3">
                {PAY_METHODS.map((m) => (
                  <li key={m.id}>
                    <label
                      className={cn(
                        "flex cursor-pointer items-center gap-3.5 rounded-sm border px-4 py-3.5 transition-colors",
                        method === m.id
                          ? "border-gold-500 bg-cream-50"
                          : "border-gold-200 hover:border-gold-400",
                      )}
                    >
                      <input
                        type="radio"
                        name="pay"
                        checked={method === m.id}
                        onChange={() => setMethod(m.id)}
                        className="size-4 accent-plum-800"
                      />
                      <span>
                        <span className="block text-sm text-plum-800">{m.label}</span>
                        <span className="block text-[0.68rem] text-ink-soft">{m.note}</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => setStep("Shipping")}>
                  <ChevronLeft className="size-3.5" /> Back
                </Button>
                <Button size="lg" onClick={() => setStep("Review")}>
                  Review Order
                </Button>
              </div>
            </>
          )}

          {step === "Review" && (
            <>
              <h2 className="font-display text-xl text-plum-800">Review Your Order</h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="rounded-sm border border-gold-200 p-4">
                  <h3 className="label-caps text-[0.6rem] text-gold-700">Deliver To</h3>
                  <p className="mt-2 text-sm text-plum-800">{addr.fullName}</p>
                  <p className="mt-0.5 text-[0.72rem] leading-relaxed text-ink-soft">
                    {addr.address}
                    <br />
                    {addr.city}, {addr.state} – {addr.pincode}
                    <br />
                    {addr.phone}
                  </p>
                </div>
                <div className="rounded-sm border border-gold-200 p-4">
                  <h3 className="label-caps text-[0.6rem] text-gold-700">Paying With</h3>
                  <p className="mt-2 text-sm text-plum-800">
                    {PAY_METHODS.find((m) => m.id === method)?.label}
                  </p>
                  <p className="mt-0.5 text-[0.72rem] text-ink-soft">via Razorpay</p>
                </div>
              </div>

              <ul className="mt-6 divide-y divide-gold-200/60 border-y border-gold-200/60">
                {resolved.map((l) => (
                  <li key={`${l.slug}-${l.shade ?? ""}`} className="flex items-center gap-3.5 py-3.5">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-cream-50">
                      <Image src={l.product.image} alt="" fill sizes="48px" className="object-contain p-1" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.8rem] text-plum-800">{l.product.name}</p>
                      <p className="text-[0.68rem] text-ink-soft">
                        {[l.shade, l.product.size, `Qty: ${l.qty}`].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <span className="text-sm text-plum-800">{inr(l.lineTotal)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => setStep("Payment")}>
                  <ChevronLeft className="size-3.5" /> Back
                </Button>
                <Button size="lg" onClick={placeOrder} disabled={placing}>
                  <Lock className="size-3.5" />
                  {placing ? "Placing Order…" : `Place Order · ${inr(t.total)}`}
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-6">
            <h2 className="font-display text-xl text-plum-800">Order Summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Subtotal ({t.itemCount} Items)</dt>
                <dd className="text-plum-800">{inr(t.subtotal)}</dd>
              </div>
              {t.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Discount ({coupon})</dt>
                  <dd className="font-medium text-success">- {inr(t.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink-soft">Shipping</dt>
                <dd className={t.shipping === 0 ? "font-medium text-success" : "text-plum-800"}>
                  {t.shipping === 0 ? "FREE" : inr(t.shipping)}
                </dd>
              </div>
            </dl>
            <div className="mt-4 flex items-end justify-between border-t border-gold-200/70 pt-4">
              <div>
                <p className="text-sm font-medium text-plum-800">Total</p>
                <p className="text-[0.65rem] text-ink-soft">Inclusive of all taxes</p>
              </div>
              <p className="font-display text-2xl font-semibold text-plum-800">{inr(t.total)}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: "numeric" | "text";
  className?: string;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className={className}>
      <label htmlFor={id} className="label-caps mb-1.5 block text-[0.6rem] text-gold-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-sm border border-gold-200 bg-cream-50 px-3.5 py-2.5 text-sm text-plum-800 placeholder:text-ink-soft/50 focus:border-gold-500 focus:outline-none"
      />
    </div>
  );
}
