"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import LiveToggle from "@/components/ui/LiveToggle";
import DataTable, { type Column } from "@/components/ui/DataTable";
import { api, ApiError } from "@/lib/api/client";
import type { Coupon, CouponType } from "@/lib/api/types";
import { inr, num, cn } from "@/lib/utils";

/** How a coupon's stored value reads to a person. */
function describe(c: Coupon) {
  if (c.type === "PERCENTAGE") return `${c.value / 100}% off`;
  if (c.type === "FIXED") return `${inr(c.value / 100)} off`;
  return "Free shipping";
}

function isExpired(c: Coupon) {
  return !!c.expiresAt && new Date(c.expiresAt) < new Date();
}

function DeleteCoupon({ coupon }: { coupon: Coupon }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const used = coupon.usedCount > 0;

  async function remove() {
    const msg = used
      ? `${coupon.code} has been used ${coupon.usedCount} time(s), so it will be deactivated rather than deleted — past orders keep pointing at it.`
      : `Delete ${coupon.code}? It has never been used.`;
    if (!window.confirm(msg)) return;
    setBusy(true);
    try {
      await api("DELETE", `/admin/coupons/${coupon.id}`);
      router.refresh();
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : "Couldn't delete the coupon");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={remove}
      disabled={busy}
      aria-label={`${used ? "Deactivate" : "Delete"} ${coupon.code}`}
      title={used ? "Deactivate (it has been used)" : "Delete"}
      className="grid size-7 place-items-center rounded-lg border border-hairline text-muted hover:border-critical hover:text-critical disabled:opacity-40"
    >
      <Trash2 className="size-3.5" />
    </button>
  );
}

const columns: Column<Coupon>[] = [
  {
    key: "code",
    header: "Code",
    cell: (c) => (
      <span className="rounded-md border border-dashed border-series-1/40 bg-series-1/5 px-2 py-1 font-medium tracking-wide text-series-1">
        {c.code}
      </span>
    ),
  },
  {
    key: "value",
    header: "Discount",
    value: (c) => describe(c),
    cell: (c) => (
      <span>
        <span className="block text-ink">{describe(c)}</span>
        <span className="block text-[0.68rem] text-muted">
          {[
            c.minOrderPaise > 0 && `min ${inr(c.minOrderPaise / 100)}`,
            c.firstOrderOnly && "first order only",
          ]
            .filter(Boolean)
            .join(" · ") || "no conditions"}
        </span>
      </span>
    ),
  },
  {
    key: "usedCount",
    header: "Used",
    align: "right",
    cell: (c) => (
      <span className="tnum">
        {num(c.usedCount)}
        <span className="text-muted"> / {c.usageLimit ? num(c.usageLimit) : "∞"}</span>
      </span>
    ),
  },
  {
    key: "expiresAt",
    header: "Expires",
    value: (c) => c.expiresAt ?? "9999",
    cell: (c) =>
      c.expiresAt ? (
        <span className={cn(isExpired(c) && "text-critical")}>
          {new Date(c.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      ) : (
        <span className="text-muted">Never</span>
      ),
  },
  {
    key: "status",
    header: "Status",
    value: (c) => (isExpired(c) ? "Expired" : c.isActive ? "Active" : "Inactive"),
    cell: (c) =>
      isExpired(c) ? (
        <Badge tone="critical">Expired</Badge>
      ) : (
        <Badge tone={c.isActive ? "good" : "neutral"}>{c.isActive ? "Active" : "Inactive"}</Badge>
      ),
  },
  {
    key: "controls",
    header: "",
    sortable: false,
    align: "right",
    cell: (c) => (
      <span className="inline-flex items-center gap-3">
        <LiveToggle on={c.isActive} label={`${c.code} active`} path={`/admin/coupons/${c.id}`} field="isActive" />
        <DeleteCoupon coupon={c} />
      </span>
    ),
  },
];

const filters = [
  { label: "Active", test: (c: Coupon) => c.isActive && !isExpired(c) },
  { label: "Inactive", test: (c: Coupon) => !c.isActive },
  { label: "Expired", test: isExpired },
];

function CreateCoupon() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [type, setType] = useState<CouponType>("PERCENTAGE");
  const [amount, setAmount] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [limit, setLimit] = useState("");
  const [perCustomer, setPerCustomer] = useState("");
  const [expires, setExpires] = useState("");
  const [firstOnly, setFirstOnly] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFields({});

    const local: Record<string, string> = {};
    const amt = Number(amount);
    if (type !== "FREE_SHIPPING" && (!amount.trim() || !Number.isFinite(amt) || amt <= 0)) {
      local.value = type === "PERCENTAGE" ? "Enter a percentage, e.g. 15" : "Enter an amount in ₹";
    }
    if (type === "PERCENTAGE" && amt > 100) local.value = "Can't be more than 100%";
    const min = minOrder.trim() ? Number(minOrder) : 0;
    if (!Number.isFinite(min) || min < 0) local.minOrderPaise = "Enter an amount in ₹";
    if (Object.keys(local).length) {
      setFields(local);
      return;
    }

    setBusy(true);
    try {
      await api("POST", "/admin/coupons", {
        code: code.trim(),
        type,
        // percent → basis points; rupees → paise
        value: type === "PERCENTAGE" ? Math.round(amt * 100) : type === "FIXED" ? Math.round(amt * 100) : 0,
        minOrderPaise: Math.round(min * 100),
        usageLimit: limit.trim() ? Number(limit) : null,
        perCustomerLimit: perCustomer.trim() ? Number(perCustomer) : null,
        firstOrderOnly: firstOnly,
        // end of the chosen day, not midnight at its start
        expiresAt: expires ? new Date(`${expires}T23:59:59`).toISOString() : null,
      });
      setCode(""); setAmount(""); setMinOrder(""); setLimit(""); setPerCustomer(""); setExpires(""); setFirstOnly(false);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setFields(err.fields);
        setError(err.status === 400 ? null : err.message);
      } else {
        setError("Couldn't create the coupon.");
      }
    } finally {
      setBusy(false);
    }
  }

  const input = (err?: string) =>
    cn(
      "w-full rounded-lg border bg-card px-3.5 py-2.5 text-[0.8rem] text-ink placeholder:text-muted focus:outline-none",
      err ? "border-critical" : "border-hairline focus:border-series-1",
    );

  return (
    <Card title="Create Coupon">
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error && (
          <p role="alert" className="flex items-center gap-2 text-[0.76rem] text-critical">
            <AlertCircle className="size-4 shrink-0" /> {error}
          </p>
        )}
        <F label="Code *" error={fields.code}>
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="MONSOON15" className={input(fields.code)} />
        </F>
        <F label="Type">
          <select value={type} onChange={(e) => setType(e.target.value as CouponType)} className={input()}>
            <option value="PERCENTAGE">Percentage off</option>
            <option value="FIXED">Fixed amount off</option>
            <option value="FREE_SHIPPING">Free shipping</option>
          </select>
        </F>
        <div className="grid grid-cols-2 gap-3">
          {type !== "FREE_SHIPPING" && (
            <F label={type === "PERCENTAGE" ? "Percent *" : "Amount (₹) *"} error={fields.value}>
              <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={type === "PERCENTAGE" ? "15" : "200"} className={input(fields.value)} />
            </F>
          )}
          <F label="Min. Order (₹)" error={fields.minOrderPaise}>
            <input inputMode="decimal" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} placeholder="0" className={input(fields.minOrderPaise)} />
          </F>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <F label="Total Uses" error={fields.usageLimit}>
            <input inputMode="numeric" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="Unlimited" className={input(fields.usageLimit)} />
          </F>
          <F label="Per Customer" error={fields.perCustomerLimit}>
            <input inputMode="numeric" value={perCustomer} onChange={(e) => setPerCustomer(e.target.value)} placeholder="Unlimited" className={input(fields.perCustomerLimit)} />
          </F>
        </div>
        <F label="Expires On" error={fields.expiresAt}>
          <input type="date" value={expires} onChange={(e) => setExpires(e.target.value)} className={input(fields.expiresAt)} />
        </F>
        <label className="flex cursor-pointer items-center justify-between gap-4">
          <span className="text-[0.78rem] text-ink-2">First order only</span>
          <input type="checkbox" checked={firstOnly} onChange={(e) => setFirstOnly(e.target.checked)} className="size-4 accent-[var(--color-series-1)]" />
        </label>
        <Button type="submit" className="w-full" disabled={busy || !code.trim()}>
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
          {busy ? "Creating…" : "Create Coupon"}
        </Button>
      </form>
    </Card>
  );
}

function F({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block">
        <span className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">{label}</span>
        {children}
      </label>
      {error && <p className="mt-1 text-[0.7rem] text-critical">{error}</p>}
    </div>
  );
}

export default function CouponsManager({ coupons }: { coupons: Coupon[] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
      <DataTable
        rows={coupons}
        columns={columns}
        rowKey={(c) => c.id}
        filters={filters}
        searchPlaceholder="Search codes…"
        emptyMessage="No coupons yet."
      />
      <CreateCoupon />
    </div>
  );
}
