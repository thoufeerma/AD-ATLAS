"use client";

import { Plus, Pencil } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Toggle from "@/components/ui/Toggle";
import { OFFERS } from "@/lib/mock";

export default function OffersPage() {
  const live = OFFERS.filter((o) => o.active).length;

  return (
    <>
      <PageHeader
        title="Offers & Deals"
        subtitle={`${live} of ${OFFERS.length} promotions currently running`}
        actions={
          <Button size="sm">
            <Plus className="size-3.5" /> New Offer
          </Button>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {OFFERS.map((o) => (
          <Card key={o.id}>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-[0.95rem] font-semibold leading-snug text-ink">
                {o.name}
              </h2>
              <Toggle defaultOn={o.active} label={`Enable ${o.name}`} />
            </div>

            <p className="mt-2 text-[0.78rem] text-ink-2">{o.scope}</p>

            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-hairline pt-4 text-[0.72rem]">
              <div>
                <dt className="text-muted">Starts</dt>
                <dd className="tnum mt-0.5 text-ink">{o.starts}</dd>
              </div>
              <div>
                <dt className="text-muted">Ends</dt>
                <dd className="tnum mt-0.5 text-ink">{o.ends}</dd>
              </div>
            </dl>

            <div className="mt-4 flex items-center justify-between">
              <Badge tone={o.active ? "good" : "neutral"}>
                {o.active ? "Running" : "Paused"}
              </Badge>
              <button className="inline-flex items-center gap-1 text-[0.72rem] font-medium text-series-1 hover:underline">
                <Pencil className="size-3" /> Edit
              </button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
