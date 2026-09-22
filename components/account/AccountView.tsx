"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, FileText, Loader2, LogOut, MailCheck, MapPin, Package, Pencil, Plus, Star, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import ReturnPanel from "@/components/order/ReturnPanel";
import { api, ApiError } from "@/lib/api/client";
import { setSignedIn, signOut, useAccount, type Me } from "@/lib/account";
import type { InvoiceLink, OrderStatus, Product } from "@/lib/api/types";
import { cn, inrPaise, productImage } from "@/lib/utils";
import { INDIAN_STATES, listedState } from "@/lib/states";

type AccountOrder = {
  number: string;
  status: OrderStatus;
  paymentMethod: string;
  placedAt: string;
  totalPaise: number;
  shippingMethod: string | null;
  items: { slug: string | null; name: string; shade: string | null; quantity: number; lineTotalPaise: number }[];
  invoice: InvoiceLink;
};

export type SavedAddress = {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Awaiting payment",
  CONFIRMED: "Confirmed",
  PROCESSING: "Being prepared",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

const card = "rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-6";
const input =
  "w-full rounded-sm border border-gold-200 bg-cream-50 px-3.5 py-2.5 text-sm text-plum-800 placeholder:text-ink-soft/50 focus:border-gold-500 focus:outline-none";

export default function AccountView({ products }: { products: Product[] }) {
  const router = useRouter();
  const { status, me } = useAccount();

  useEffect(() => {
    if (status === "guest") router.replace("/login?next=/account");
  }, [status, router]);

  if (status !== "signed-in" || !me) {
    return <div className="container-vel min-h-[50vh] py-16" aria-busy="true" />;
  }

  async function leave() {
    await signOut();
    router.replace("/");
  }

  return (
    <div className="container-vel py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl text-plum-800">Hello, {me.name.split(/\s+/)[0]}</h2>
          <p className="mt-1 text-[0.8rem] text-ink-soft">{me.email}</p>
        </div>
        <Button variant="outline" size="sm" onClick={leave}>
          <LogOut className="size-3.5" /> Sign Out
        </Button>
      </div>

      {!me.emailVerified && <VerifyBanner email={me.email} />}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Orders verified={me.emailVerified} products={products} />
          <Addresses />
        </div>
        <div className="space-y-6">
          <Profile me={me} />
          <Password email={me.email} />
        </div>
      </div>
    </div>
  );
}

/* ── Email not verified yet ── */

function VerifyBanner({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function resend() {
    setState("sending");
    try {
      await api("POST", "/account/verify/resend");
      setState("sent");
    } catch (err) {
      setError((err as Error).message);
      setState("error");
    }
  }

  return (
    <div className="mb-6 flex flex-wrap items-start gap-4 rounded-[var(--radius-card)] border border-gold-300/60 bg-blush-100 p-5">
      <MailCheck className="mt-0.5 size-5 shrink-0 text-gold-600" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-plum-800">Confirm your email to see your orders</p>
        <p className="mt-1 text-[0.75rem] leading-relaxed text-ink-soft">
          We sent a link to <strong className="text-plum-800">{email}</strong>. Once you click it, your
          order history — including earlier orders with this email — appears here. Can&apos;t find
          it? Check your spam folder.
        </p>
        {state === "error" && <p className="mt-2 text-[0.72rem] text-danger">{error}</p>}
      </div>
      {state === "sent" ? (
        <span className="flex items-center gap-1.5 text-[0.75rem] text-success">
          <Check className="size-4" /> New link sent
        </span>
      ) : (
        <Button size="sm" variant="outline" onClick={resend} disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Send the link again"}
        </Button>
      )}
    </div>
  );
}

/* ── Orders ── */

function Orders({ verified, products }: { verified: boolean; products: Product[] }) {
  const [orders, setOrders] = useState<AccountOrder[] | null>(null);
  const [error, setError] = useState("");
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  useEffect(() => {
    if (!verified) return;
    api<AccountOrder[]>("GET", "/account/orders")
      .then(setOrders)
      .catch((err) => setError((err as Error).message));
  }, [verified]);

  return (
    <section className={card}>
      <h3 className="flex items-center gap-2 font-display text-xl text-plum-800">
        <Package className="size-5 text-gold-600" /> My Orders
      </h3>

      {!verified ? (
        <p className="mt-4 text-[0.8rem] text-ink-soft">Your orders will show here once your email is confirmed.</p>
      ) : error ? (
        <p className="mt-4 text-[0.8rem] text-danger">{error}</p>
      ) : !orders ? (
        <Loader2 className="mt-6 size-5 animate-spin text-ink-soft" />
      ) : orders.length === 0 ? (
        <div className="mt-4 text-[0.8rem] text-ink-soft">
          No orders yet.{" "}
          <Link href="/shop" className="text-gold-700 hover:text-gold-600">
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-5 divide-y divide-gold-200/70">
          {orders.map((o) => (
            <li key={o.number} className="py-4 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-plum-800">
                  <span className="font-medium">#{o.number}</span>
                  <span className="ml-2 text-[0.72rem] text-ink-soft">
                    {new Date(o.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </p>
                <span
                  className={cn(
                    "rounded-sm px-2 py-0.5 text-[0.66rem] font-medium",
                    o.status === "DELIVERED"
                      ? "bg-success/12 text-success"
                      : o.status === "CANCELLED" || o.status === "REFUNDED"
                        ? "bg-cream-300 text-ink-soft"
                        : "bg-gold-200/60 text-gold-700",
                  )}
                >
                  {STATUS_LABEL[o.status]}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {o.items.map((i, n) => {
                  const p = i.slug ? bySlug.get(i.slug) : undefined;
                  return (
                    <span key={n} className="flex items-center gap-2 rounded-sm bg-cream-50 py-1 pl-1 pr-2.5 text-[0.7rem] text-plum-800">
                      <span className="relative size-8 overflow-hidden rounded-sm bg-cream-200/60">
                        {p && <Image src={productImage(p)} alt="" fill sizes="32px" className="object-contain p-0.5" />}
                      </span>
                      {i.name}
                      {i.shade ? ` · ${i.shade}` : ""} × {i.quantity}
                    </span>
                  );
                })}
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[0.75rem]">
                <span className="text-ink-soft">
                  Total <strong className="text-plum-800">{inrPaise(o.totalPaise)}</strong>
                  {o.paymentMethod === "COD" && " · Cash on delivery"}
                </span>
                <span className="flex items-center gap-4">
                  {o.invoice && (
                    <a
                      href={o.invoice.url}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-1 text-plum-600 hover:text-gold-600"
                    >
                      <FileText className="size-3.5" /> Invoice
                    </a>
                  )}
                  <Link href={`/track-order?order=${o.number}`} className="text-gold-700 hover:text-gold-600">
                    Track order →
                  </Link>
                </span>
              </div>
              {/* Shows itself only when there's something to say about returns */}
              <ReturnPanel orderNumber={o.number} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ── Saved addresses ── */

const EMPTY_ADDRESS = { fullName: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", isDefault: false };
type AddressDraft = typeof EMPTY_ADDRESS;

function Addresses() {
  const [addresses, setAddresses] = useState<SavedAddress[] | null>(null);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api<SavedAddress[]>("GET", "/account/addresses")
      .then(setAddresses)
      .catch((err) => setError((err as Error).message));
  }, []);
  useEffect(load, [load]);

  async function run(fn: () => Promise<SavedAddress[]>) {
    setError("");
    try {
      setAddresses(await fn());
      setEditing(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <section className={card}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-xl text-plum-800">
          <MapPin className="size-5 text-gold-600" /> Saved Addresses
        </h3>
        {editing !== "new" && (addresses?.length ?? 0) < 10 && (
          <Button size="sm" variant="outline" onClick={() => setEditing("new")}>
            <Plus className="size-3.5" /> Add
          </Button>
        )}
      </div>
      {error && <p className="mt-3 text-[0.75rem] text-danger">{error}</p>}

      {editing === "new" && (
        <AddressForm
          initial={EMPTY_ADDRESS}
          onCancel={() => setEditing(null)}
          onSave={(d) => run(() => api("POST", "/account/addresses", d))}
        />
      )}

      {!addresses ? (
        <Loader2 className="mt-6 size-5 animate-spin text-ink-soft" />
      ) : addresses.length === 0 && editing !== "new" ? (
        <p className="mt-4 text-[0.8rem] text-ink-soft">
          No saved addresses. Save one here, or tick &ldquo;Save this address&rdquo; at checkout.
        </p>
      ) : (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {addresses.map((a) =>
            editing === a.id ? (
              <li key={a.id} className="sm:col-span-2">
                <AddressForm
                  initial={{ ...a, line2: a.line2 ?? "" }}
                  onCancel={() => setEditing(null)}
                  onSave={(d) => run(() => api("PATCH", `/account/addresses/${a.id}`, d))}
                />
              </li>
            ) : (
              <li key={a.id} className={cn("rounded-sm border bg-cream-50 p-4", a.isDefault ? "border-gold-500" : "border-gold-200")}>
                <p className="flex items-center gap-2 text-sm text-plum-800">
                  {a.fullName}
                  {a.isDefault && <span className="rounded-sm bg-gold-200/60 px-1.5 py-0.5 text-[0.6rem] text-gold-700">Default</span>}
                </p>
                <p className="mt-1 text-[0.72rem] leading-relaxed text-ink-soft">
                  {a.line1}
                  {a.line2 && <>, {a.line2}</>}
                  <br />
                  {a.city}, {a.state} – {a.pincode}
                  <br />
                  {a.phone}
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-[0.7rem]">
                  <button onClick={() => setEditing(a.id)} className="inline-flex items-center gap-1 text-plum-600 hover:text-gold-600">
                    <Pencil className="size-3" /> Edit
                  </button>
                  {!a.isDefault && (
                    <button
                      onClick={() => run(() => api("PATCH", `/account/addresses/${a.id}`, { isDefault: true }))}
                      className="inline-flex items-center gap-1 text-plum-600 hover:text-gold-600"
                    >
                      <Star className="size-3" /> Make default
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (window.confirm("Remove this address?")) run(() => api("DELETE", `/account/addresses/${a.id}`));
                    }}
                    className="inline-flex items-center gap-1 text-ink-soft hover:text-danger"
                  >
                    <Trash2 className="size-3" /> Remove
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </section>
  );
}

function AddressForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: AddressDraft;
  onSave: (d: Omit<AddressDraft, "line2"> & { line2: string | null }) => Promise<void>;
  onCancel: () => void;
}) {
  const [d, setD] = useState({ ...initial, state: listedState(initial.state) });
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const set = (k: keyof AddressDraft) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setD((v) => ({ ...v, [k]: k === "isDefault" ? (e.target as HTMLInputElement).checked : e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const phone = d.phone.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
    const issue =
      d.fullName.trim().length < 2
        ? "Enter the recipient's name."
        : !/^[6-9]\d{9}$/.test(phone)
          ? "Enter a 10-digit mobile number."
          : d.line1.trim().length < 3
            ? "Enter the street address."
            : d.city.trim().length < 2
              ? "Enter the city."
              : !d.state
                ? "Choose the state."
              : !/^[1-9]\d{5}$/.test(d.pincode.trim())
                ? "Enter a 6-digit pincode."
                : "";
    if (issue) {
      setProblem(issue);
      return;
    }
    setBusy(true);
    setProblem("");
    await onSave({ ...d, phone, line2: d.line2.trim() || null });
    setBusy(false);
  }

  return (
    <form onSubmit={submit} noValidate className="mt-4 grid gap-3 rounded-sm border border-gold-200 bg-cream-50 p-4 sm:grid-cols-2">
      <input aria-label="Full name" placeholder="Full name" value={d.fullName} onChange={set("fullName")} autoComplete="name" className={input} />
      <input aria-label="Mobile number" placeholder="Mobile number" value={d.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel-national" className={input} />
      <input aria-label="Address" placeholder="House, street, area" value={d.line1} onChange={set("line1")} autoComplete="address-line1" className={cn(input, "sm:col-span-2")} />
      <input aria-label="Apartment, landmark (optional)" placeholder="Apartment, landmark (optional)" value={d.line2} onChange={set("line2")} autoComplete="address-line2" className={cn(input, "sm:col-span-2")} />
      <input aria-label="City" placeholder="City" value={d.city} onChange={set("city")} autoComplete="address-level2" className={input} />
      <select aria-label="State" value={d.state} onChange={set("state")} autoComplete="address-level1" className={cn(input, !d.state && "text-ink-soft/70")}>
        <option value="">State</option>
        {INDIAN_STATES.map((s) => (
          <option key={s} value={s} className="text-plum-800">
            {s}
          </option>
        ))}
      </select>
      <input aria-label="Pincode" placeholder="Pincode" value={d.pincode} onChange={set("pincode")} inputMode="numeric" autoComplete="postal-code" className={input} />
      <label className="flex items-center gap-2 text-[0.75rem] text-ink-soft">
        <input type="checkbox" checked={d.isDefault} onChange={set("isDefault")} className="size-3.5 accent-plum-800" />
        Use as my default address
      </label>
      {problem && <p className="text-[0.72rem] text-danger sm:col-span-2">{problem}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? "Saving…" : "Save Address"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

/* ── Profile ── */

function Profile({ me }: { me: Me }) {
  const [name, setName] = useState(me.name);
  const [phone, setPhone] = useState(me.phone ?? "");
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    setError("");
    try {
      setSignedIn(await api<Me>("PATCH", "/account/me", { name: name.trim(), phone: phone.trim() }));
      setState("saved");
    } catch (err) {
      setError(err instanceof ApiError && err.fields.phone ? "Enter a 10-digit mobile number, or leave it empty." : (err as Error).message);
      setState("idle");
    }
  }

  return (
    <section className={card}>
      <h3 className="font-display text-xl text-plum-800">Profile</h3>
      <form onSubmit={save} noValidate className="mt-4 space-y-3">
        <label className="block">
          <span className="mb-1 block text-[0.7rem] font-medium text-plum-800">Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={input} />
        </label>
        <label className="block">
          <span className="mb-1 block text-[0.7rem] font-medium text-plum-800">Mobile number</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel-national" placeholder="Optional" className={input} />
        </label>
        <p className="text-[0.68rem] text-ink-soft">Email: {me.email}</p>
        {error && <p className="text-[0.72rem] text-danger">{error}</p>}
        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" disabled={state === "saving" || name.trim().length < 2}>
            {state === "saving" ? "Saving…" : "Save"}
          </Button>
          {state === "saved" && (
            <span className="flex items-center gap-1 text-[0.72rem] text-success">
              <Check className="size-3.5" /> Saved
            </span>
          )}
        </div>
      </form>
    </section>
  );
}

/* ── Password ── */

function Password({ email }: { email: string }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (next.length < 8) {
      setError("Use at least 8 characters for the new password.");
      return;
    }
    setState("saving");
    setError("");
    try {
      setSignedIn(await api<Me>("POST", "/account/password", { currentPassword: current, newPassword: next }));
      setCurrent("");
      setNext("");
      setState("saved");
    } catch (err) {
      const fields = err instanceof ApiError ? err.fields : {};
      setError(fields.currentPassword ?? fields.newPassword ?? (err as Error).message);
      setState("idle");
    }
  }

  return (
    <section className={card}>
      <h3 className="font-display text-xl text-plum-800">Change Password</h3>
      <form onSubmit={save} noValidate className="mt-4 space-y-3">
        <input type="text" name="username" autoComplete="username" value={email} readOnly hidden />
        <input type="password" aria-label="Current password" placeholder="Current password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" className={input} />
        <input type="password" aria-label="New password" placeholder="New password (8+ characters)" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" className={input} />
        {error && (
          <p className="flex items-start gap-1.5 text-[0.72rem] text-danger">
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" /> {error}
          </p>
        )}
        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" disabled={state === "saving" || !current || !next}>
            {state === "saving" ? "Saving…" : "Change Password"}
          </Button>
          {state === "saved" && (
            <span className="flex items-center gap-1 text-[0.72rem] text-success">
              <Check className="size-3.5" /> Changed
            </span>
          )}
        </div>
        <p className="text-[0.68rem] text-ink-soft">Changing it signs you out on your other devices.</p>
      </form>
    </section>
  );
}
