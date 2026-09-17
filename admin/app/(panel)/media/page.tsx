"use client";

import { Upload, Trash2, Link2, ImageIcon } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { MEDIA } from "@/lib/mock";

export default function MediaPage() {
  const unused = MEDIA.filter((m) => m.used === 0).length;

  return (
    <>
      <PageHeader
        title="Media Library"
        subtitle={`${MEDIA.length} files${unused ? ` · ${unused} unused` : ""}`}
        actions={
          <Button size="sm">
            <Upload className="size-3.5" /> Upload Files
          </Button>
        }
      />

      <div className="mb-5 grid place-items-center rounded-[var(--radius-card)] border border-dashed border-hairline bg-card px-4 py-10 text-center">
        <Upload className="size-6 text-muted" />
        <p className="mt-3 text-[0.82rem] text-ink">Drop files anywhere to upload</p>
        <p className="mt-1 text-[0.7rem] text-muted">
          PNG, JPG, WEBP or SVG · up to 5 MB each
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {MEDIA.map((m) => (
          <Card key={m.id} bodyClassName="p-0">
            <div className="grid aspect-4/3 place-items-center rounded-t-[var(--radius-card)] bg-plane">
              <ImageIcon className="size-7 text-muted" />
            </div>
            <div className="p-4">
              <p className="truncate text-[0.78rem] font-medium text-ink" title={m.name}>
                {m.name}
              </p>
              <p className="tnum mt-0.5 text-[0.68rem] text-muted">
                {m.dims} · {m.size}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <Badge tone={m.used ? "good" : "warning"} dot={false}>
                  {m.used ? `Used ${m.used}×` : "Unused"}
                </Badge>
                <span className="flex gap-1.5">
                  <button
                    aria-label={`Copy link to ${m.name}`}
                    className="grid size-7 place-items-center rounded-lg border border-hairline text-muted hover:border-series-1 hover:text-series-1"
                  >
                    <Link2 className="size-3.5" />
                  </button>
                  <button
                    aria-label={`Delete ${m.name}`}
                    className="grid size-7 place-items-center rounded-lg border border-hairline text-muted hover:border-critical hover:text-critical"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
