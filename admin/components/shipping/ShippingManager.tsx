"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowDown, ArrowUp, Loader2, Pencil, Plus, Trash2, Truck } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { api, ApiError } from "@/lib/api/client";
import type { ShippingMethod } from "@/lib/api/types";
import { cn, inr } from "@/lib/utils";

const rupees = (paise: number) => inr(paise / 100);

export default function ShippingManager({ methods }: { methods: ShippingMethod[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstOn = methods.find((m) => m.isEnabled);

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const move = (i: number, by: -1 | 1) => {
    const ids = methods.map((m) => m.id);
    const [id] = ids.splice(i, 1);
    ids.splice(i + by, 0, id!);
    run(() => api("PUT", "/admin/shipping-methods/order", { ids }));
  };
  const toggle = (m: ShippingMethod) =>
    run(() => api("PATCH", `/admin/shipping-methods/${m.id}`, { isEnabled: !m.isEnabled }));
  const remove = (m: ShippingMethod) => {
    if (!window.confirm(`Delete “${m.name}”? Past orders keep their record of it.`)) return;
    run(() => api("DELETE", `/admin/shipping-methods/${m.id}`));
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        {error && (
          <p role="alert" className="flex items-start gap-2 rounded-lg border border-critical/30 bg-critical/5 px-4 py-3 text-[0.76rem] text-critical">
            <AlertCircle className="mt-0.5 size-4 shrink-0" /> {error}
          </p>
        )}

        <Card title="Methods" bodyClassName="p-0">
          <ul className="divide-y divide-hairline">
            {methods.map((m, i) => (
              <li key={m.id} className={cn("px-5 py-4", !m.isEnabled && "bg-plane/60")}>
                {editing === m.id ? (
                  <MethodForm
                    initial={m}
                    onCancel={() => setEditing(null)}
                    onSaved={() => {
                      setEditing(null);
                      router.refresh();
                    }}
                  />
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-[0.85rem] font-medium text-ink">
                        {m.name}
                        {m.id === firstOn?.id && <Badge tone="info" dot={false}>Default</Badge>}
                        {!m.isEnabled && <Badge tone="neutral">Off</Badge>}
                      </p>
                      <p className="mt-0.5 text-[0.7rem] text-muted">{m.eta}</p>
                    </div>
                    <span className="tnum text-[0.82rem] font-medium text-ink">
                      {m.pricePaise === 0 ? "Free" : rupees(m.pricePaise)}
                    </span>
                    {m.freeAbovePaise != null && m.pricePaise > 0 && (
                      <Badge tone="good" dot={false}>
                        Free above {rupees(m.freeAbovePaise)}
                      </Badge>
                    )}
                    <span className="flex items-center gap-1">
                      <Icon label="Move up" disabled={busy || i === 0} onClick={() => move(i, -1)}>
                        <ArrowUp className="size-3.5" />
                      </Icon>
                      <Icon label="Move down" disabled={busy || i === methods.length - 1} onClick={() => move(i, 1)}>
                        <ArrowDown className="size-3.5" />
                      </Icon>
                      <Icon label={`Edit ${m.name}`} disabled={busy} onClick={() => setEditing(m.id)}>
                        <Pencil className="size-3.5" />
                      </Icon>
                      <Icon label={`Delete ${m.name}`} disabled={busy} onClick={() => remove(m)} danger>
                        <Trash2 className="size-3.5" />
                      </Icon>
                    </span>
                    <button
                      role="switch"
                      aria-checked={m.isEnabled}
                      aria-label={`${m.name} offered at checkout`}
                      disabled={busy}
                      onClick={() => toggle(m)}
                      className={cn(
                        "relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-50",
                        m.isEnabled ? "bg-series-1" : "bg-[#d9d7e0]",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 size-4 rounded-full bg-white shadow transition-all",
                          m.isEnabled ? "left-[18px]" : "left-0.5",
                        )}
                      />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Card>

        {adding ? (
          <Card title="Add Method">
            <MethodForm
              onCancel={() => setAdding(false)}
              onSaved={() => {
                setAdding(false);
                router.refresh();
              }}
            />
          </Card>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
            <Plus className="size-3.5" /> Add Method
          </Button>
        )}
        {busy && <Loader2 className="size-4 animate-spin text-muted" />}
      </div>

      <Card title="How checkout uses these">
        <ul className="space-y-3 text-[0.74rem] leading-relaxed text-ink-2">
          <li className="flex gap-2.5">
            <Truck className="mt-0.5 size-4 shrink-0 text-series-1" />
            Shoppers choose between the methods that are <strong>on</strong>, in this order.
          </li>
          <li>
            The first one on is the <strong>default</strong>. Its price and free-shipping amount are
            what the store advertises: the &ldquo;Free shipping above…&rdquo; notes on the homepage,
            product pages and cart, and the <code>{"{{free_shipping_above}}"}</code> and{" "}
            <code>{"{{shipping_fee}}"}</code> values in your policy pages.
          </li>
          <li className="rounded-lg bg-warning/10 px-3 py-2 text-[#8a5d00]">
            The announcement bar is a banner with its own text — if you change the free-shipping
            amount, update it under <strong>Banners</strong> too.
          </li>
          <li>
            &ldquo;Free above&rdquo; is checked after discounts. Leave it blank for a method that
            always costs the same. A free-shipping coupon makes whichever method they pick free.
          </li>
          <li>Changes reach the store within about a minute. Past orders keep the method they were placed with.</li>
        </ul>
      </Card>
    </div>
  );
}

function Icon({
  label,
  disabled,
  onClick,
  danger,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "grid size-7 place-items-center rounded-lg border border-hairline text-muted disabled:opacity-30",
        danger ? "hover:border-critical hover:text-critical" : "hover:border-series-1 hover:text-series-1",
      )}
    >
      {children}
    </button>
  );
}

/* ── Add / edit ── */

/** "149" or "149.50" → 14950; "" → null. Returns NaN for anything else. */
function toPaise(v: string): number | null {
  const s = v.trim().replace(/,/g, "");
  if (s === "") return null;
  return /^\d+(\.\d{1,2})?$/.test(s) ? Math.round(Number(s) * 100) : NaN;
}
const toRupees = (p: number | null) => (p == null ? "" : String(p / 100));

function MethodForm({
  initial,
  onCancel,
  onSaved,
}: {
  initial?: ShippingMethod;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [eta, setEta] = useState(initial?.eta ?? "");
  const [price, setPrice] = useState(toRupees(initial?.pricePaise ?? null));
  const [freeAbove, setFreeAbove] = useState(toRupees(initial?.freeAbovePaise ?? null));
  const [on, setOn] = useState(initial?.isEnabled ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pricePaise = toPaise(price);
  const freeAbovePaise = toPaise(freeAbove);
  const problems = {
    name: name.trim().length < 2 ? "Give it a name, e.g. Express Shipping." : null,
    eta: eta.trim().length < 2 ? "Say how long it takes, e.g. 1 – 2 business days." : null,
    price: pricePaise == null || Number.isNaN(pricePaise) ? "Enter a price in rupees (0 for free)." : null,
    freeAbove: Number.isNaN(freeAbovePaise) ? "Enter an amount in rupees, or leave it blank." : null,
  };
  const [showErrors, setShowErrors] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (Object.values(problems).some(Boolean)) {
      setShowErrors(true);
      return;
    }
    const body = {
      name: name.trim(),
      eta: eta.trim(),
      pricePaise,
      freeAbovePaise: pricePaise === 0 ? null : freeAbovePaise,
      isEnabled: on,
    };
    setBusy(true);
    setError(null);
    try {
      if (initial) await api("PATCH", `/admin/shipping-methods/${initial.id}`, body);
      else await api("POST", "/admin/shipping-methods", body);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const input = (bad: boolean) =>
    cn(
      "w-full rounded-lg border bg-card px-3.5 py-2.5 text-[0.8rem] text-ink focus:outline-none",
      bad ? "border-critical" : "border-hairline focus:border-series-1",
    );
  const err = (k: keyof typeof problems) => (showErrors ? problems[k] : null);

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {error && (
        <p role="alert" className="flex items-center gap-2 text-[0.76rem] text-critical">
          <AlertCircle className="size-4 shrink-0" /> {error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" error={err("name")}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Express Shipping" className={input(!!err("name"))} />
        </Field>
        <Field label="Delivery time" error={err("eta")}>
          <input value={eta} onChange={(e) => setEta(e.target.value)} placeholder="1 – 2 business days" className={input(!!err("eta"))} />
        </Field>
        <Field label="Price (₹)" error={err("price")}>
          <input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="99" className={cn(input(!!err("price")), "tnum")} />
        </Field>
        <Field label="Free above (₹, optional)" error={err("freeAbove")} hint="Blank = never free.">
          <input
            inputMode="decimal"
            value={pricePaise === 0 ? "" : freeAbove}
            disabled={pricePaise === 0}
            onChange={(e) => setFreeAbove(e.target.value)}
            placeholder={pricePaise === 0 ? "Always free" : "999"}
            className={cn(input(!!err("freeAbove")), "tnum disabled:bg-plane")}
          />
        </Field>
      </div>
      <label className="flex items-center gap-2.5 text-[0.78rem] text-ink-2">
        <input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} className="size-4 accent-[var(--color-series-1)]" />
        Offer this method at checkout
      </label>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={busy}>
          {busy && <Loader2 className="size-3.5 animate-spin" />}
          {busy ? "Saving…" : initial ? "Save" : "Add Method"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string | null;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-[0.7rem] text-critical">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-[0.68rem] text-muted">{hint}</span>
      ) : null}
    </label>
  );
}
