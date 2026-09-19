"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Lock, ChevronLeft, Truck, ShoppingBag, AlertCircle, MapPin, UserCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import QuoteSummary from "@/components/cart/QuoteSummary";
import { useStore, useHydrated } from "@/lib/store";
import { resolveCart, quoteItems, useQuote } from "@/lib/cart";
import { api } from "@/lib/api/client";
import type { PaymentMethod, PlacedOrder, Product } from "@/lib/api/types";
import { inrPaise, cn, looksLikeEmail, productImage } from "@/lib/utils";
import { LAST_ORDER_KEY, type LastOrder } from "./lastOrder";
import { useAccount } from "@/lib/account";
import type { SavedAddress } from "@/components/account/AccountView";

/**
 * No full checkout design exists in the reference set — only the small
 * Shipping / Payment / Review thumbnail on web-page-design-Passed-01.png.
 * This follows that three-step structure, styled to match M-Cart.
 *
 * Orders are created by the API, which re-prices everything from the database
 * and reserves stock. Online payment (Razorpay) isn't connected yet, so cash
 * on delivery is the only method that can be chosen for now.
 */
const STEPS = ["Shipping", "Payment", "Review"] as const;
type Step = (typeof STEPS)[number];

const PAY_METHODS: { id: PaymentMethod; label: string; note: string; available: boolean }[] = [
  { id: "UPI", label: "UPI", note: "Google Pay, PhonePe, Paytm & more", available: false },
  { id: "CARD", label: "Credit / Debit Card", note: "Visa, Mastercard, RuPay, Amex", available: false },
  { id: "NETBANKING", label: "Net Banking", note: "All major Indian banks", available: false },
  { id: "WALLET", label: "Wallets", note: "Paytm, Amazon Pay, Mobikwik", available: false },
  { id: "COD", label: "Cash on Delivery", note: "Pay when your order arrives", available: true },
];

type Address = {
  fullName: string;
  phone: string;
  email: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
};

const EMPTY: Address = {
  fullName: "",
  phone: "",
  email: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

/** "+91 98765 43210" → "9876543210", matching what the API accepts. */
const mobileDigits = (s: string) => s.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");

/** Same rules the API applies, with wording meant for shoppers. */
function validate(a: Address): Partial<Record<keyof Address, string>> {
  const errors: Partial<Record<keyof Address, string>> = {};
  if (a.fullName.trim().length < 2) errors.fullName = "Enter your full name.";
  if (!/^[6-9]\d{9}$/.test(mobileDigits(a.phone))) errors.phone = "Enter a 10-digit mobile number.";
  if (!looksLikeEmail(a.email)) errors.email = "Enter a valid email address.";
  if (a.line1.trim().length < 3) errors.line1 = "Enter your street address.";
  if (a.city.trim().length < 2) errors.city = "Enter your city.";
  if (a.state.trim().length < 2) errors.state = "Enter your state.";
  if (!/^[1-9]\d{5}$/.test(a.pincode.trim())) errors.pincode = "Enter a 6-digit pincode.";
  return errors;
}

export default function CheckoutFlow({ products }: { products: Product[] }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("Shipping");
  const [addr, setAddr] = useState<Address>(EMPTY);

  // Signed in: fill in their details once, fix the email to the account's,
  // and offer their saved addresses (the default one pre-selected).
  const { status: accountStatus, me } = useAccount();
  const [prefilledFor, setPrefilledFor] = useState<string | null>(null);
  if (me && prefilledFor !== me.id) {
    setPrefilledFor(me.id);
    setAddr((a) => ({
      ...a,
      fullName: a.fullName || me.name,
      email: me.email,
      phone: a.phone || me.phone || "",
    }));
  }
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [saveAddress, setSaveAddress] = useState(true);
  useEffect(() => {
    if (accountStatus !== "signed-in") return;
    api<SavedAddress[]>("GET", "/account/addresses")
      .then((list) => {
        setSavedAddresses(list);
        const preferred = list.find((a) => a.isDefault);
        if (preferred) setAddr((a) => (a.line1 ? a : fromSaved(a, preferred)));
      })
      .catch(() => {});
  }, [accountStatus]);
  const matchesSaved = savedAddresses.some(
    (a) => a.line1.toLowerCase() === addr.line1.trim().toLowerCase() && a.pincode === addr.pincode.trim(),
  );
  const [showErrors, setShowErrors] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("COD");
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState("");
  const [placed, setPlaced] = useState(false);
  // The delivery option the shopper picked; null = the store's default.
  const [shippingMethodId, setShippingMethodId] = useState<string | null>(null);

  const hydrated = useHydrated();
  const lines = useStore((s) => s.lines);
  const coupon = useStore((s) => s.coupon);
  const clear = useStore((s) => s.clear);

  const rows = resolveCart(lines, products);
  const items = quoteItems(rows);
  const blocked = rows.some((r) => r.problem);
  const errors = validate(addr);
  const shippingValid = Object.keys(errors).length === 0;

  // With a valid email the quote also checks first-order-only codes.
  const email = looksLikeEmail(addr.email) ? addr.email.trim() : null;
  const { quote, error, stale } = useQuote(
    hydrated && !blocked ? { items, couponCode: coupon, email, shippingMethodId } : null,
  );

  if (!hydrated) return <div className="container-vel py-20" aria-hidden />;

  // The cart is emptied the moment the order exists; hold this screen until
  // the confirmation page takes over, instead of flashing "cart is empty".
  if (placed) {
    return (
      <div role="status" className="container-vel py-24 text-center text-sm text-ink-soft">
        Order placed — taking you to your confirmation…
      </div>
    );
  }

  if (rows.length === 0) {
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

  if (blocked) {
    return (
      <div className="container-vel py-20 text-center">
        <AlertCircle className="mx-auto size-10 text-gold-500" />
        <h2 className="mt-5 font-display text-2xl text-plum-800">Your cart needs a look</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Some items are no longer available. Remove them from your cart to continue.
        </p>
        <Button href="/cart" className="mt-7">
          Back to Cart
        </Button>
      </div>
    );
  }

  const couponProblem = coupon && quote && !stale && !quote.coupon ? quote.couponError : null;
  const ready = !!quote && !stale && !error;

  // The highlighted delivery option: what was picked, if it's still on offer.
  const options = quote?.shippingOptions ?? [];
  const selectedShipping = options.some((o) => o.id === shippingMethodId)
    ? shippingMethodId
    : (quote?.shipping?.id ?? null);
  const afterDiscount = quote ? quote.subtotalPaise - quote.discountPaise : 0;

  function continueToPayment() {
    if (!shippingValid) {
      setShowErrors(true);
      return;
    }
    setStep("Payment");
  }

  async function placeOrder() {
    if (!quote || !ready || placing) return;
    setPlacing(true);
    setPlaceError("");
    try {
      const order = await api<PlacedOrder>("POST", "/orders", {
        items,
        // Only send a code the latest quote actually applied; the API refuses
        // an order whose entered code no longer applies.
        couponCode: quote.coupon ? coupon : null,
        // The option this total was priced with; the API refuses to swap it.
        shippingMethodId: quote.shipping?.id ?? null,
        email: addr.email.trim(),
        name: addr.fullName.trim(),
        phone: mobileDigits(addr.phone),
        shipping: {
          line1: addr.line1.trim(),
          line2: addr.line2.trim() || null,
          city: addr.city.trim(),
          state: addr.state.trim(),
          pincode: addr.pincode.trim(),
        },
        paymentMethod: method,
        saveAddress: me ? saveAddress && !matchesSaved : undefined,
      });

      const saved: LastOrder = {
        order,
        email: addr.email.trim(),
        address: {
          name: addr.fullName.trim(),
          phone: mobileDigits(addr.phone),
          line1: addr.line1.trim(),
          line2: addr.line2.trim(),
          city: addr.city.trim(),
          state: addr.state.trim(),
          pincode: addr.pincode.trim(),
        },
      };
      try {
        sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(saved));
      } catch {
        // Storage can throw in private modes; the success page copes without it.
      }
      setPlaced(true);
      clear();
      router.push(`/order-success?order=${order.number}`);
    } catch (err) {
      setPlaceError((err as Error).message);
      setPlacing(false);
    }
  }

  const stepIndex = STEPS.indexOf(step);
  const fieldError = (k: keyof Address) => (showErrors ? errors[k] : undefined);
  const set = (k: keyof Address) => (v: string) => setAddr((a) => ({ ...a, [k]: v }));

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
              {me ? (
                <p className="mt-2 flex items-center gap-2 text-[0.75rem] text-ink-soft">
                  <UserCheck className="size-4 text-success" /> Signed in as {me.email}
                </p>
              ) : accountStatus === "guest" ? (
                <p className="mt-2 text-[0.75rem] text-ink-soft">
                  Have an account?{" "}
                  <Link href="/login?next=/checkout" className="text-gold-700 hover:text-gold-600">
                    Sign in
                  </Link>{" "}
                  to use your saved details — or just continue as a guest.
                </p>
              ) : null}

              {savedAddresses.length > 0 && (
                <div className="mt-5">
                  <p className="label-caps text-[0.6rem] text-gold-700">Your saved addresses</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {savedAddresses.map((a) => {
                      const chosen =
                        a.line1.toLowerCase() === addr.line1.trim().toLowerCase() && a.pincode === addr.pincode.trim();
                      return (
                        <li key={a.id}>
                          <button
                            type="button"
                            onClick={() => setAddr((prev) => fromSaved(prev, a))}
                            aria-pressed={chosen}
                            className={cn(
                              "flex max-w-[16rem] items-start gap-2 rounded-sm border px-3 py-2 text-left text-[0.72rem] transition-colors",
                              chosen ? "border-gold-500 bg-cream-50 text-plum-800" : "border-gold-200 text-ink-soft hover:border-gold-400",
                            )}
                          >
                            <MapPin className="mt-0.5 size-3.5 shrink-0 text-gold-600" />
                            <span className="truncate">
                              {a.line1}, {a.city} {a.pincode}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field
                  id="fullName"
                  label="Full Name"
                  value={addr.fullName}
                  onChange={set("fullName")}
                  error={fieldError("fullName")}
                  placeholder="Ananya Sharma"
                  autoComplete="name"
                />
                <Field
                  id="phone"
                  label="Mobile Number"
                  value={addr.phone}
                  onChange={set("phone")}
                  error={fieldError("phone")}
                  placeholder="98765 43210"
                  inputMode="tel"
                  autoComplete="tel-national"
                />
                <Field
                  id="email"
                  label="Email Address"
                  value={addr.email}
                  onChange={set("email")}
                  error={fieldError("email")}
                  placeholder="you@example.com"
                  type="email"
                  autoComplete="email"
                  className="sm:col-span-2"
                  readOnly={!!me}
                  hint={me ? "Orders from your account use its email." : undefined}
                />
                <Field
                  id="line1"
                  label="Address"
                  value={addr.line1}
                  onChange={set("line1")}
                  error={fieldError("line1")}
                  placeholder="123, Lotus Residency, MG Road, Andheri West"
                  autoComplete="address-line1"
                  className="sm:col-span-2"
                />
                <Field
                  id="line2"
                  label="Apartment, Landmark (optional)"
                  value={addr.line2}
                  onChange={set("line2")}
                  placeholder="Near City Mall"
                  autoComplete="address-line2"
                  className="sm:col-span-2"
                />
                <Field
                  id="city"
                  label="City"
                  value={addr.city}
                  onChange={set("city")}
                  error={fieldError("city")}
                  placeholder="Mumbai"
                  autoComplete="address-level2"
                />
                <Field
                  id="state"
                  label="State"
                  value={addr.state}
                  onChange={set("state")}
                  error={fieldError("state")}
                  placeholder="Maharashtra"
                  autoComplete="address-level1"
                />
                <Field
                  id="pincode"
                  label="Pincode"
                  value={addr.pincode}
                  onChange={set("pincode")}
                  error={fieldError("pincode")}
                  placeholder="400053"
                  inputMode="numeric"
                  autoComplete="postal-code"
                />
              </div>

              {me && !matchesSaved && (
                <label className="mt-5 flex cursor-pointer items-center gap-2.5 text-[0.75rem] text-ink-soft">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="size-3.5 accent-plum-800"
                  />
                  Save this address to my account
                </label>
              )}

              {options.length > 0 && (
                <fieldset className="mt-7">
                  <legend className="label-caps text-[0.6rem] text-gold-700">Delivery</legend>
                  <ul className="mt-2.5 space-y-2.5">
                    {options.map((o) => {
                      const chosen = o.id === selectedShipping;
                      const shortOf =
                        o.pricePaise > 0 && o.freeAbovePaise != null ? o.freeAbovePaise - afterDiscount : null;
                      return (
                        <li key={o.id}>
                          <label
                            className={cn(
                              "flex cursor-pointer items-center gap-3.5 rounded-sm border px-4 py-3 transition-colors",
                              chosen ? "border-gold-500 bg-cream-50" : "border-gold-200 hover:border-gold-400",
                            )}
                          >
                            <input
                              type="radio"
                              name="delivery"
                              checked={chosen}
                              onChange={() => setShippingMethodId(o.id)}
                              className="size-4 accent-plum-800"
                            />
                            <Truck className="size-4 shrink-0 text-gold-600" />
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm text-plum-800">{o.name}</span>
                              <span className="block text-[0.68rem] text-ink-soft">
                                {o.eta}
                                {shortOf != null && shortOf > 0 && (
                                  <> · add {inrPaise(shortOf)} more for free delivery</>
                                )}
                              </span>
                            </span>
                            <span
                              className={cn(
                                "text-sm",
                                o.pricePaise === 0 ? "font-medium text-success" : "text-plum-800",
                              )}
                            >
                              {o.pricePaise === 0 ? "FREE" : inrPaise(o.pricePaise)}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </fieldset>
              )}

              <Button className="mt-7 w-full sm:w-auto" size="lg" onClick={continueToPayment}>
                Continue to Payment
              </Button>
              {showErrors && !shippingValid && (
                <p role="alert" className="mt-2.5 text-[0.72rem] text-danger">
                  Please fix the highlighted fields to continue.
                </p>
              )}
            </>
          )}

          {step === "Payment" && (
            <>
              <h2 className="font-display text-xl text-plum-800">Payment Method</h2>
              <p className="mt-1 text-[0.72rem] text-ink-soft">
                Online payment through Razorpay is coming soon. For now, pay in cash when
                your order arrives.
              </p>

              <ul className="mt-6 space-y-3">
                {PAY_METHODS.map((m) => (
                  <li key={m.id}>
                    <label
                      className={cn(
                        "flex items-center gap-3.5 rounded-sm border px-4 py-3.5 transition-colors",
                        !m.available
                          ? "cursor-not-allowed border-gold-200/60 opacity-55"
                          : method === m.id
                            ? "cursor-pointer border-gold-500 bg-cream-50"
                            : "cursor-pointer border-gold-200 hover:border-gold-400",
                      )}
                    >
                      <input
                        type="radio"
                        name="pay"
                        checked={method === m.id}
                        disabled={!m.available}
                        onChange={() => setMethod(m.id)}
                        className="size-4 accent-plum-800"
                      />
                      <span className="flex-1">
                        <span className="block text-sm text-plum-800">{m.label}</span>
                        <span className="block text-[0.68rem] text-ink-soft">{m.note}</span>
                      </span>
                      {!m.available && (
                        <span className="label-caps rounded-sm bg-cream-300 px-2 py-0.5 text-[0.52rem] text-ink-soft">
                          Coming Soon
                        </span>
                      )}
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
                    {addr.line1}
                    {addr.line2 && (
                      <>
                        <br />
                        {addr.line2}
                      </>
                    )}
                    <br />
                    {addr.city}, {addr.state} – {addr.pincode}
                    <br />
                    {addr.phone}
                  </p>
                  {quote?.shipping && (
                    <p className="mt-2 flex items-center gap-1.5 text-[0.72rem] text-plum-800">
                      <Truck className="size-3.5 text-gold-600" />
                      {quote.shipping.name} · {quote.shipping.eta}
                    </p>
                  )}
                </div>
                <div className="rounded-sm border border-gold-200 p-4">
                  <h3 className="label-caps text-[0.6rem] text-gold-700">Paying With</h3>
                  <p className="mt-2 text-sm text-plum-800">
                    {PAY_METHODS.find((m) => m.id === method)?.label}
                  </p>
                  <p className="mt-0.5 text-[0.72rem] text-ink-soft">
                    {method === "COD" ? "Pay when your order arrives" : "via Razorpay"}
                  </p>
                </div>
              </div>

              <ul className="mt-6 divide-y divide-gold-200/60 border-y border-gold-200/60">
                {rows.map((r) =>
                  r.product ? (
                    <li key={`${r.slug}-${r.shade ?? ""}`} className="flex items-center gap-3.5 py-3.5">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-cream-50">
                        <Image src={productImage(r.product)} alt="" fill sizes="48px" className="object-contain p-1" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[0.8rem] text-plum-800">{r.product.name}</p>
                        <p className="text-[0.68rem] text-ink-soft">
                          {[r.shade, r.product.size, `Qty: ${r.qty}`].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <span className="text-sm text-plum-800">
                        {inrPaise(r.product.pricePaise * r.qty)}
                      </span>
                    </li>
                  ) : null,
                )}
              </ul>

              {placeError && (
                <p role="alert" className="mt-5 flex items-start gap-2 rounded-sm bg-blush-100 px-3.5 py-3 text-[0.75rem] text-plum-800">
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-danger" />
                  {placeError}
                </p>
              )}

              <div className="mt-7 flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => setStep("Payment")} disabled={placing}>
                  <ChevronLeft className="size-3.5" /> Back
                </Button>
                <Button size="lg" onClick={placeOrder} disabled={placing || !ready}>
                  <Lock className="size-3.5" />
                  {placing
                    ? "Placing Order…"
                    : quote && ready
                      ? `Place Order · ${inrPaise(quote.totalPaise)}`
                      : "Updating total…"}
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-6">
            <h2 className="font-display text-xl text-plum-800">Order Summary</h2>
            <QuoteSummary quote={quote} stale={stale || !!error} totalLabel="Total" />
            {(error || couponProblem) && (
              <p role="alert" className="mt-4 flex items-start gap-2 rounded-sm bg-blush-100 px-3 py-2.5 text-[0.72rem] text-plum-800">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-danger" />
                {error ?? `${coupon} isn't applied: ${couponProblem}.`}
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  inputMode,
  autoComplete,
  className,
  readOnly,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  inputMode?: "numeric" | "tel" | "text";
  autoComplete?: string;
  className?: string;
  readOnly?: boolean;
  hint?: string;
}) {
  const inputId = `co-${id}`;
  return (
    <div className={className}>
      <label htmlFor={inputId} className="label-caps mb-1.5 block text-[0.6rem] text-gold-700">
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn(
          "w-full rounded-sm border bg-cream-50 px-3.5 py-2.5 text-sm text-plum-800 placeholder:text-ink-soft/50 focus:outline-none",
          error ? "border-danger focus:border-danger" : "border-gold-200 focus:border-gold-500",
          readOnly && "cursor-not-allowed bg-cream-200/60 text-ink-soft",
        )}
      />
      {error ? (
        <p id={`${inputId}-error`} className="mt-1 text-[0.68rem] text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-[0.68rem] text-ink-soft">{hint}</p>
      ) : null}
    </div>
  );
}

/** Fills the address fields from a saved address, keeping the email. */
function fromSaved(a: Address, saved: SavedAddress): Address {
  return {
    ...a,
    fullName: saved.fullName,
    phone: saved.phone,
    line1: saved.line1,
    line2: saved.line2 ?? "",
    city: saved.city,
    state: saved.state,
    pincode: saved.pincode,
  };
}
