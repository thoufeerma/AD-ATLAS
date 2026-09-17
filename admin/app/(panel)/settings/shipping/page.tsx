"use client";

import { Save, Plus, Pencil } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Toggle from "@/components/ui/Toggle";
import { SHIPPING_METHODS } from "@/lib/mock";

export default function ShippingPage() {
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <PageHeader
        title="Shipping Methods"
        subtitle="Rates and delivery windows offered at checkout"
        actions={
          <>
            <Button variant="outline" size="sm" type="button">
              <Plus className="size-3.5" /> Add Method
            </Button>
            <Button size="sm" type="submit">
              <Save className="size-3.5" /> Save Changes
            </Button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card title="Methods" bodyClassName="p-0">
          <ul className="divide-y divide-hairline">
            {SHIPPING_METHODS.map((m) => (
              <li key={m.id} className="flex items-center gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[0.85rem] font-medium text-ink">{m.name}</p>
                  <p className="mt-0.5 text-[0.7rem] text-muted">{m.eta}</p>
                </div>
                <span className="tnum text-[0.8rem] text-ink">{m.price}</span>
                {m.freeAbove !== "—" && (
                  <Badge tone="good" dot={false}>
                    Free above {m.freeAbove}
                  </Badge>
                )}
                <Toggle defaultOn={m.enabled} label={`Enable ${m.name}`} />
                <button
                  type="button"
                  aria-label={`Edit ${m.name}`}
                  className="grid size-8 place-items-center rounded-lg border border-hairline text-muted hover:border-series-1 hover:text-series-1"
                >
                  <Pencil className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-5">
          <Card title="Free Shipping Threshold">
            <Label>Orders above</Label>
            <div className="flex items-center gap-2.5 rounded-lg border border-hairline bg-card px-3.5 focus-within:border-series-1">
              <span className="text-[0.8rem] text-muted">₹</span>
              <input
                defaultValue="999"
                inputMode="numeric"
                className="tnum w-full bg-transparent py-2.5 text-[0.8rem] text-ink focus:outline-none"
              />
            </div>
            <p className="mt-2 text-[0.68rem] leading-relaxed text-muted">
              Calculated after discounts. Shown on the storefront announcement bar
              and in the cart.
            </p>
          </Card>

          <Card title="Serviceable Regions">
            <ul className="space-y-4">
              {[
                { label: "All India", on: true },
                { label: "International shipping", on: false },
                { label: "Block non-serviceable pincodes at checkout", on: true },
              ].map((r) => (
                <li key={r.label} className="flex items-center justify-between gap-4">
                  <span className="text-[0.78rem] text-ink-2">{r.label}</span>
                  <Toggle defaultOn={r.on} label={r.label} />
                </li>
              ))}
            </ul>
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
