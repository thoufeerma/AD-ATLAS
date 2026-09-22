"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, X, Loader2, AlertCircle, Archive, Boxes } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ImageField } from "@/components/media/MediaPicker";
import { api, ApiError } from "@/lib/api/client";
import type { Category, ProductDetail, ProductStatus, Shade, ProductImage } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL ?? "http://localhost:3000";

const STATUSES: { value: ProductStatus; label: string; note: string }[] = [
  { value: "DRAFT", label: "Draft", note: "Hidden from the storefront" },
  { value: "ACTIVE", label: "Active", note: "Visible and purchasable" },
  { value: "COMING_SOON", label: "Coming Soon", note: "Visible, not purchasable" },
  { value: "ARCHIVED", label: "Archived", note: "Hidden, kept for order history" },
];

/** GST slabs offered in the picker; a product saved at another rate keeps it. */
const GST_RATES = [0, 500, 1800, 4000];

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Rupees typed by a person → integer paise for the API. "" → null. */
function toPaise(rupees: string): number | null {
  const t = rupees.trim();
  if (t === "") return null;
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return NaN;
  return Math.round(Number(t) * 100);
}
const fromPaise = (p: number | null | undefined) =>
  p == null ? "" : (p / 100).toFixed(p % 100 === 0 ? 0 : 2);

type Props =
  | { mode: "create"; categories: Category[]; product?: undefined }
  | { mode: "edit"; categories: Category[]; product: ProductDetail };

export default function ProductForm({ mode, categories, product }: Props) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [sku, setSku] = useState(product?.sku ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories[0]?.id ?? "");
  const [descriptor, setDescriptor] = useState(product?.descriptor ?? "");
  const [blurb, setBlurb] = useState(product?.blurb ?? "");
  const [size, setSize] = useState(product?.size ?? "");
  const [price, setPrice] = useState(fromPaise(product?.pricePaise));
  const [compareAt, setCompareAt] = useState(fromPaise(product?.compareAtPaise));
  const [hsnCode, setHsnCode] = useState(product?.hsnCode ?? "3304");
  const [gstRateBps, setGstRateBps] = useState(product?.gstRateBps ?? 1800);
  const [stock, setStock] = useState("0");
  const [lowStock, setLowStock] = useState(String(product?.lowStockThreshold ?? 15));
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? "DRAFT");
  const [bestseller, setBestseller] = useState(product?.isBestseller ?? false);
  const [benefits, setBenefits] = useState((product?.benefits ?? []).join("\n"));
  const [metaTitle, setMetaTitle] = useState(product?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(product?.metaDescription ?? "");
  const [shades, setShades] = useState<Shade[]>(product?.shades ?? []);
  const [images, setImages] = useState<ProductImage[]>(product?.images ?? []);

  const [saving, setSaving] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const effectiveSlug = slugTouched ? slug : slugify(name);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSaved(false);

    // Catch the obvious locally, with the field named, before a round trip.
    const local: Record<string, string> = {};
    const pricePaise = toPaise(price);
    const compareAtPaise = toPaise(compareAt);
    if (pricePaise === null) local.pricePaise = "Enter a price";
    else if (Number.isNaN(pricePaise)) local.pricePaise = "Use a number like 799 or 799.50";
    if (compareAtPaise !== null && Number.isNaN(compareAtPaise)) {
      local.compareAtPaise = "Use a number like 999 or 999.50";
    }
    if (!isEdit && !/^\d+$/.test(stock)) local.stock = "Whole number of units";
    if (!/^\d+$/.test(lowStock)) local.lowStockThreshold = "Whole number of units";
    if (!/^\d{4}(\d{2}){0,2}$/.test(hsnCode.trim())) local.hsnCode = "4, 6 or 8 digits, e.g. 3304";
    if (Object.keys(local).length) {
      setFieldErrors(local);
      setError("Fix the highlighted fields.");
      return;
    }

    const body = {
      name: name.trim(),
      slug: effectiveSlug,
      sku: sku.trim(),
      categoryId,
      descriptor: descriptor.trim() || null,
      blurb: blurb.trim() || null,
      size: size.trim() || null,
      pricePaise,
      compareAtPaise,
      hsnCode: hsnCode.trim(),
      gstRateBps,
      status,
      isBestseller: bestseller,
      lowStockThreshold: Number(lowStock),
      benefits: benefits.split("\n").map((b) => b.trim()).filter(Boolean),
      metaTitle: metaTitle.trim() || null,
      metaDescription: metaDescription.trim() || null,
      shades,
      images,
      // Stock is only set on create. Afterwards it changes through Inventory,
      // so a stale form can't overwrite units sold while it was open.
      ...(isEdit ? {} : { stock: Number(stock) }),
    };

    setSaving(true);
    try {
      if (isEdit) {
        await api("PATCH", `/admin/products/${product.id}`, body);
        setSaved(true);
        router.refresh();
      } else {
        const created = await api<{ id: string }>("POST", "/admin/products", body);
        router.push(`/products/${created.id}`);
        router.refresh();
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.fields);
        setError(err.status === 400 ? "Fix the highlighted fields." : err.message);
      } else {
        setError("Couldn't save. Check your connection and try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function archive() {
    if (!isEdit) return;
    if (!window.confirm(`Archive "${product.name}"? It disappears from the storefront but stays in past orders.`)) return;
    setArchiving(true);
    try {
      await api("DELETE", `/admin/products/${product.id}`);
      router.push("/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't archive the product.");
      setArchiving(false);
    }
  }

  const fe = (key: string) => fieldErrors[key];

  return (
    <form onSubmit={onSubmit} noValidate>
      <Link href="/products" className="mb-4 inline-flex items-center gap-1.5 text-[0.76rem] text-ink-2 hover:text-ink">
        <ArrowLeft className="size-3.5" /> Back to products
      </Link>

      <PageHeader
        title={isEdit ? product.name : "Add New Product"}
        subtitle={isEdit ? `SKU ${product.sku}` : "Fields marked * are required"}
        actions={
          <>
            {isEdit && product.status !== "ARCHIVED" && (
              <Button type="button" variant="danger" size="sm" onClick={archive} disabled={archiving}>
                <Archive className="size-3.5" /> {archiving ? "Archiving…" : "Archive"}
              </Button>
            )}
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
            </Button>
          </>
        }
      />

      {error && (
        <p role="alert" className="mb-5 flex items-center gap-2 rounded-lg border border-critical/25 bg-critical/5 px-4 py-3 text-[0.8rem] text-critical">
          <AlertCircle className="size-4 shrink-0" /> {error}
        </p>
      )}
      {saved && !error && (
        <p role="status" className="mb-5 rounded-lg border border-good/25 bg-good/10 px-4 py-3 text-[0.8rem] text-[#0a7f0a]">
          Changes saved.
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <Card title="Basics">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Product Name *" error={fe("name")} className="sm:col-span-2">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Velastia Velvet Matte Lipstick" className={inputCls(fe("name"))} />
              </Field>
              <Field label="URL Slug" error={fe("slug")} className="sm:col-span-2" hint={`${STORE_URL}/product/${effectiveSlug || "…"}`}>
                <input
                  value={effectiveSlug}
                  onChange={(e) => { setSlugTouched(true); setSlug(e.target.value); }}
                  placeholder="generated from the name"
                  className={inputCls(fe("slug"))}
                />
              </Field>
              <Field label="Category *" error={fe("categoryId")}>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputCls(fe("categoryId"))}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="SKU *" error={fe("sku")}>
                <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="VEL-LIP-001" className={inputCls(fe("sku"))} />
              </Field>
              <Field label="Short Descriptor" error={fe("descriptor")} hint="Shown on cart and wishlist rows">
                <input value={descriptor} onChange={(e) => setDescriptor(e.target.value)} placeholder="Long Stay · Smooth Matte Finish" className={inputCls(fe("descriptor"))} />
              </Field>
              <Field label="Size" error={fe("size")}>
                <input value={size} onChange={(e) => setSize(e.target.value)} placeholder="30ml" className={inputCls(fe("size"))} />
              </Field>
              <Field label="Description" error={fe("blurb")} className="sm:col-span-2">
                <textarea rows={3} value={blurb} onChange={(e) => setBlurb(e.target.value)} className={inputCls(fe("blurb"))} />
              </Field>
              <Field label="Benefits" error={fe("benefits")} className="sm:col-span-2" hint="One per line — shown as the product page checklist">
                <textarea rows={4} value={benefits} onChange={(e) => setBenefits(e.target.value)} placeholder={"Velvety matte finish with no dryness\nEnriched with Vitamin E"} className={inputCls(fe("benefits"))} />
              </Field>
            </div>
          </Card>

          <Card title="Pricing & Stock">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Price (₹) *" error={fe("pricePaise")} hint="GST-inclusive">
                <input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="799" className={inputCls(fe("pricePaise"))} />
              </Field>
              <Field label="Compare-at Price (₹)" error={fe("compareAtPaise")} hint="Shown struck through, if higher">
                <input inputMode="decimal" value={compareAt} onChange={(e) => setCompareAt(e.target.value)} placeholder="999" className={inputCls(fe("compareAtPaise"))} />
              </Field>
              {isEdit ? (
                <div>
                  <p className="mb-1.5 text-[0.7rem] font-medium text-ink-2">Stock</p>
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-plane px-3.5 py-2.5">
                    <span className="tnum text-[0.85rem] font-medium text-ink">{product.stock} units</span>
                    <Link href="/inventory" className="inline-flex items-center gap-1 text-[0.72rem] font-medium text-series-1 hover:underline">
                      <Boxes className="size-3.5" /> Adjust in Inventory
                    </Link>
                  </div>
                </div>
              ) : (
                <Field label="Opening Stock *" error={fe("stock")}>
                  <input inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value)} className={inputCls(fe("stock"))} />
                </Field>
              )}
              <Field label="Low-stock Alert At" error={fe("lowStockThreshold")} hint="Flagged on the dashboard at or below this">
                <input inputMode="numeric" value={lowStock} onChange={(e) => setLowStock(e.target.value)} className={inputCls(fe("lowStockThreshold"))} />
              </Field>
              <Field label="HSN Code *" error={fe("hsnCode")} hint="Printed on invoices. 3304 = make-up and skin care">
                <input inputMode="numeric" value={hsnCode} onChange={(e) => setHsnCode(e.target.value)} placeholder="3304" className={inputCls(fe("hsnCode"))} />
              </Field>
              <Field label="GST Rate *" error={fe("gstRateBps")} hint="Already inside the price above">
                <select value={gstRateBps} onChange={(e) => setGstRateBps(Number(e.target.value))} className={inputCls(fe("gstRateBps"))}>
                  {[...new Set([...GST_RATES, gstRateBps])].sort((a, b) => a - b).map((bps) => (
                    <option key={bps} value={bps}>{bps / 100}%</option>
                  ))}
                </select>
              </Field>
            </div>
          </Card>

          <Card title="Shades">
            {shades.length === 0 && (
              <p className="mb-3 text-[0.76rem] text-ink-2">No shades. Add some if customers choose a colour for this product.</p>
            )}
            <ul className="space-y-3">
              {shades.map((s, i) => {
                const hexErr = fe(`shades.${i}.hex`);
                const update = (patch: Partial<Shade>) =>
                  setShades((v) => v.map((x, n) => (n === i ? { ...x, ...patch } : x)));
                return (
                  <li key={i}>
                    <div className="flex items-center gap-3">
                      <label className="relative size-9 shrink-0 cursor-pointer overflow-hidden rounded-lg ring-1 ring-hairline" style={{ backgroundColor: /^#[0-9a-f]{6}$/i.test(s.hex) ? s.hex : "#ffffff" }}>
                        <span className="sr-only">Pick colour for shade {i + 1}</span>
                        <input type="color" value={/^#[0-9a-f]{6}$/i.test(s.hex) ? s.hex : "#ffffff"} onChange={(e) => update({ hex: e.target.value })} className="absolute inset-0 cursor-pointer opacity-0" />
                      </label>
                      <input value={s.code} aria-label={`Shade ${i + 1} code`} onChange={(e) => update({ code: e.target.value })} className={cn(inputCls(fe(`shades.${i}.code`)), "w-16")} />
                      <input value={s.name} aria-label={`Shade ${i + 1} name`} onChange={(e) => update({ name: e.target.value })} className={cn(inputCls(fe(`shades.${i}.name`)), "min-w-0 flex-1")} />
                      <input value={s.hex} aria-label={`Shade ${i + 1} hex`} onChange={(e) => update({ hex: e.target.value })} className={cn(inputCls(hexErr), "tnum w-24")} />
                      <button type="button" onClick={() => setShades((v) => v.filter((_, n) => n !== i))} aria-label={`Remove shade ${s.name || i + 1}`} className="grid size-9 shrink-0 place-items-center rounded-lg border border-hairline text-muted hover:border-critical hover:text-critical">
                        <X className="size-3.5" />
                      </button>
                    </div>
                    {hexErr && <p className="mt-1 text-[0.7rem] text-critical">{hexErr}</p>}
                  </li>
                );
              })}
            </ul>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setShades((v) => [...v, { code: String(v.length + 1).padStart(2, "0"), name: "", hex: "#8e303b" }])}
            >
              <Plus className="size-3.5" /> Add Shade
            </Button>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Status">
            <div className="space-y-2">
              {STATUSES.map((s) => (
                <label key={s.value} className={cn("flex cursor-pointer items-start gap-3 rounded-lg border px-3.5 py-2.5", status === s.value ? "border-series-1 bg-series-1/5" : "border-hairline hover:border-series-1/40")}>
                  <input type="radio" name="status" checked={status === s.value} onChange={() => setStatus(s.value)} className="mt-1 accent-[var(--color-series-1)]" />
                  <span>
                    <span className="block text-[0.8rem] font-medium text-ink">{s.label}</span>
                    <span className="block text-[0.7rem] text-muted">{s.note}</span>
                  </span>
                </label>
              ))}
            </div>
            <label className="mt-4 flex cursor-pointer items-center justify-between gap-3">
              <span className="text-[0.78rem] text-ink-2">Feature as bestseller</span>
              <input type="checkbox" checked={bestseller} onChange={(e) => setBestseller(e.target.checked)} className="size-4 accent-[var(--color-series-1)]" />
            </label>
          </Card>

          <Card title="Images">
            <p className="mb-3 text-[0.72rem] leading-relaxed text-muted">
              Choose from the Media Library or upload new photos. The first image is the main one.
            </p>
            <ul className="space-y-3">
              {images.map((img, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <div className="min-w-0 flex-1">
                    <ImageField
                      label={`Image ${i + 1}`}
                      value={img.url}
                      invalid={!!fe(`images.${i}.url`)}
                      onChange={(url) => setImages((v) => v.map((x, n) => (n === i ? { ...x, url } : x)))}
                      onPickAlt={(alt) => setImages((v) => v.map((x, n) => (n === i ? { ...x, alt } : x)))}
                    />
                  </div>
                  <button type="button" onClick={() => setImages((v) => v.filter((_, n) => n !== i))} aria-label={`Remove image ${i + 1}`} className="grid size-9 shrink-0 place-items-center rounded-lg border border-hairline text-muted hover:border-critical hover:text-critical">
                    <X className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => setImages((v) => [...v, { url: "", alt: name }])}>
              <Plus className="size-3.5" /> Add Image
            </Button>
          </Card>

          <Card title="Search Engine">
            <Field label="Meta Title" error={fe("metaTitle")} hint={`${metaTitle.length}/70`}>
              <input value={metaTitle} maxLength={70} onChange={(e) => setMetaTitle(e.target.value)} className={inputCls(fe("metaTitle"))} />
            </Field>
            <Field label="Meta Description" error={fe("metaDescription")} hint={`${metaDescription.length}/170`} className="mt-4">
              <textarea rows={3} maxLength={170} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} className={inputCls(fe("metaDescription"))} />
            </Field>
          </Card>
        </div>
      </div>
    </form>
  );
}

function inputCls(error?: string) {
  return cn(
    "w-full rounded-lg border bg-card px-3.5 py-2.5 text-[0.8rem] text-ink placeholder:text-muted focus:outline-none",
    error ? "border-critical focus:border-critical" : "border-hairline focus:border-series-1",
  );
}

function Field({
  label,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="block">
        <span className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">{label}</span>
        {children}
      </label>
      {error ? (
        <p className="mt-1 text-[0.7rem] text-critical">{error}</p>
      ) : hint ? (
        <p className="mt-1 truncate text-[0.68rem] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
