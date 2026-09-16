"use client";

import { Save, Plus, Pencil } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Toggle from "@/components/ui/Toggle";
import { TAX_RATES } from "@/lib/mock";

export default function TaxPage() {
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <PageHeader
        title="Tax Settings"
        subtitle="GST rates applied to orders"
        actions={
          <>
            <Button variant="outline" size="sm" type="button">
              <Plus className="size-3.5" /> Add Rate
            </Button>
            <Button size="sm" type="submit">
              <Save className="size-3.5" /> Save Changes
            </Button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card title="Tax Rates" bodyClassName="p-0">
          <ul className="divide-y divide-hairline">
            {TAX_RATES.map((t) => (
              <li key={t.id} className="flex items-center gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[0.85rem] font-medium text-ink">{t.name}</p>
                  <p className="mt-0.5 text-[0.7rem] text-muted">{t.region}</p>
                </div>
                <span className="tnum text-[0.85rem] font-medium text-ink">{t.rate}</span>
                <Badge tone={t.inclusive ? "info" : "neutral"} dot={false}>
                  {t.inclusive ? "Inclusive" : "Exclusive"}
                </Badge>
                <button
                  type="button"
                  aria-label={`Edit ${t.name}`}
                  className="grid size-8 place-items-center rounded-lg border border-hairline text-muted hover:border-series-1 hover:text-series-1"
                >
                  <Pencil className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Display">
          <ul className="space-y-4">
            {[
              { label: "Show prices inclusive of tax", on: true },
              { label: "Show a tax breakdown at checkout", on: true },
              { label: "Collect GSTIN for business orders", on: true },
              { label: "Generate GST invoices automatically", on: true },
            ].map((r) => (
              <li key={r.label} className="flex items-center justify-between gap-4">
                <span className="text-[0.78rem] text-ink-2">{r.label}</span>
                <Toggle defaultOn={r.on} label={r.label} />
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[0.68rem] leading-relaxed text-muted">
            Storefront copy currently reads &ldquo;Inclusive of all taxes&rdquo; on
            product and cart pages, which matches the inclusive setting above.
          </p>
        </Card>
      </div>
    </form>
  );
}
