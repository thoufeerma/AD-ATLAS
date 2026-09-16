"use client";

import { Plus, Pencil, Trash2, GalleryHorizontal } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Toggle from "@/components/ui/Toggle";
import { BANNERS } from "@/lib/mock";
import { num } from "@/lib/utils";

export default function BannersPage() {
  const live = BANNERS.filter((b) => b.active).length;

  return (
    <>
      <PageHeader
        title="Banners"
        subtitle={`${live} live placements across the storefront`}
        actions={
          <Button size="sm">
            <Plus className="size-3.5" /> Add New Banner
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {BANNERS.map((b) => (
          <Card key={b.id} bodyClassName="p-0">
            <div className="flex items-center gap-4 p-5">
              <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#f3eefc] to-[#fdeef0]">
                <GalleryHorizontal className="size-6 text-series-1" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.88rem] font-medium text-ink">{b.name}</p>
                <p className="mt-0.5 text-[0.7rem] text-muted">{b.placement}</p>
                <p className="tnum mt-1.5 text-[0.7rem] text-ink-2">
                  {num(b.clicks)} clicks
                </p>
              </div>

              <Toggle defaultOn={b.active} label={`Enable ${b.name}`} />
            </div>

            <div className="flex items-center justify-between border-t border-hairline px-5 py-3">
              <Badge tone={b.active ? "good" : "neutral"}>
                {b.active ? "Live" : "Paused"}
              </Badge>
              <span className="flex gap-3">
                <button className="inline-flex items-center gap-1 text-[0.72rem] font-medium text-series-1 hover:underline">
                  <Pencil className="size-3" /> Edit
                </button>
                <button className="inline-flex items-center gap-1 text-[0.72rem] text-muted hover:text-critical">
                  <Trash2 className="size-3" /> Delete
                </button>
              </span>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
