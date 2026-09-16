"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Save, Upload, Plus, X } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Toggle from "@/components/ui/Toggle";
import { CATEGORIES } from "@/lib/mock";

const DEFAULT_SHADES = [
  { code: "01", name: "Rose Desire", hex: "#9a3c41" },
  { code: "02", name: "Velvet Nude", hex: "#9b3f4a" },
  { code: "03", name: "Royal Plum", hex: "#863540" },
];

export default function NewProductPage() {
  const [shades, setShades] = useState(DEFAULT_SHADES);
  const [name, setName] = useState("");

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <Link
        href="/products"
        className="mb-4 inline-flex items-center gap-1.5 text-[0.76rem] text-ink-2 hover:text-ink"
      >
        <ArrowLeft className="size-3.5" /> Back to products
      </Link>

      <PageHeader
        title="Add New Product"
        subtitle="Fields marked with an asterisk are required"
        actions={
          <>
            <Button variant="outline" size="sm" type="button">
              Save as Draft
            </Button>
            <Button size="sm" type="submit">
              <Save className="size-3.5" /> Publish Product
            </Button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <Card title="Basics">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Product Name *"
                value={name}
                onChange={setName}
                placeholder="Velastia Velvet Matte Lipstick"
                className="sm:col-span-2"
              />
              <div className="sm:col-span-2">
                <Label>URL Slug</Label>
                <div className="flex items-center gap-2 rounded-lg border border-hairline bg-plane px-3.5 py-2.5">
                  <span className="text-[0.78rem] text-muted">/product/</span>
                  <span className="text-[0.8rem] text-ink">
                    {slug || <span className="text-muted">auto-generated from the name</span>}
                  </span>
                </div>
              </div>
              <div>
                <Label>Category *</Label>
                <select className="w-full rounded-lg border border-hairline bg-card px-3.5 py-2.5 text-[0.8rem] text-ink focus:border-series-1 focus:outline-none">
                  {CATEGORIES.map((c) => (
                    <option key={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <Field label="SKU *" placeholder="VEL-LIP-001" />
              <div className="sm:col-span-2">
                <Label>Short Description</Label>
                <textarea
                  rows={3}
                  placeholder="Long Stay · Smooth Matte Finish"
                  className="w-full rounded-lg border border-hairline bg-card px-3.5 py-2.5 text-[0.8rem] text-ink placeholder:text-muted focus:border-series-1 focus:outline-none"
                />
              </div>
            </div>
          </Card>

          <Card title="Pricing & Stock">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Price (₹) *" placeholder="799" inputMode="numeric" />
              <Field label="Compare At (₹)" placeholder="999" inputMode="numeric" />
              <Field label="Stock Quantity *" placeholder="250" inputMode="numeric" />
              <Field label="Low Stock Alert" placeholder="15" inputMode="numeric" />
              <Field label="Weight (g)" placeholder="45" inputMode="numeric" />
              <Field label="HSN Code" placeholder="3304" />
            </div>
          </Card>

          <Card title="Shades">
            <ul className="space-y-3">
              {shades.map((s, i) => (
                <li key={s.code} className="flex items-center gap-3">
                  <span
                    className="size-9 shrink-0 rounded-lg ring-1 ring-hairline"
                    style={{ backgroundColor: s.hex }}
                  />
                  <input
                    defaultValue={s.code}
                    aria-label={`Shade ${i + 1} code`}
                    className="w-14 rounded-lg border border-hairline bg-card px-2.5 py-2 text-[0.78rem] text-ink focus:border-series-1 focus:outline-none"
                  />
                  <input
                    defaultValue={s.name}
                    aria-label={`Shade ${i + 1} name`}
                    className="min-w-0 flex-1 rounded-lg border border-hairline bg-card px-3 py-2 text-[0.78rem] text-ink focus:border-series-1 focus:outline-none"
                  />
                  <input
                    defaultValue={s.hex}
                    aria-label={`Shade ${i + 1} hex`}
                    className="tnum w-24 rounded-lg border border-hairline bg-card px-3 py-2 text-[0.78rem] text-ink focus:border-series-1 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShades((v) => v.filter((_, n) => n !== i))}
                    aria-label={`Remove shade ${s.name}`}
                    className="grid size-8 shrink-0 place-items-center rounded-lg border border-hairline text-muted hover:border-critical hover:text-critical"
                  >
                    <X className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() =>
                setShades((v) => [
                  ...v,
                  {
                    code: String(v.length + 1).padStart(2, "0"),
                    name: "New Shade",
                    hex: "#8e303b",
                  },
                ])
              }
            >
              <Plus className="size-3.5" /> Add Shade
            </Button>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Media">
            <div className="grid place-items-center rounded-xl border border-dashed border-hairline bg-plane px-4 py-10 text-center">
              <Upload className="size-6 text-muted" />
              <p className="mt-3 text-[0.78rem] text-ink">Drop images here</p>
              <p className="mt-1 text-[0.68rem] text-muted">PNG or JPG, up to 5 MB each</p>
              <Button type="button" variant="outline" size="sm" className="mt-4">
                Browse Files
              </Button>
            </div>
          </Card>

          <Card title="Visibility">
            <ul className="space-y-4">
              {[
                { label: "Published on storefront", on: true },
                { label: "Feature as bestseller", on: false },
                { label: "Mark as coming soon", on: false },
                { label: "Allow reviews", on: true },
              ].map((r) => (
                <li key={r.label} className="flex items-center justify-between gap-4">
                  <span className="text-[0.78rem] text-ink-2">{r.label}</span>
                  <Toggle defaultOn={r.on} label={r.label} />
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Search Engine">
            <Field label="Meta Title" placeholder="Velvet Matte Lipstick | Velastia" />
            <div className="mt-4">
              <Label>Meta Description</Label>
              <textarea
                rows={3}
                placeholder="Intense colour payoff with a velvety matte finish…"
                className="w-full rounded-lg border border-hairline bg-card px-3.5 py-2.5 text-[0.8rem] text-ink placeholder:text-muted focus:border-series-1 focus:outline-none"
              />
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">{children}</label>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  inputMode,
  className,
}: {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  inputMode?: "numeric" | "text";
  className?: string;
}) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <input
        placeholder={placeholder}
        inputMode={inputMode}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="w-full rounded-lg border border-hairline bg-card px-3.5 py-2.5 text-[0.8rem] text-ink placeholder:text-muted focus:border-series-1 focus:outline-none"
      />
    </div>
  );
}
