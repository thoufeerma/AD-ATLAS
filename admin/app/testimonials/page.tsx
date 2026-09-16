"use client";

import { Plus, Star, Pencil, Trash2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Toggle from "@/components/ui/Toggle";
import { TESTIMONIALS } from "@/lib/mock";
import { cn } from "@/lib/utils";

export default function TestimonialsPage() {
  const featured = TESTIMONIALS.filter((t) => t.featured).length;

  return (
    <>
      <PageHeader
        title="Testimonials"
        subtitle={`${featured} featured on the homepage`}
        actions={
          <Button size="sm">
            <Plus className="size-3.5" /> Add Testimonial
          </Button>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <Card key={t.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sidebar text-[0.66rem] font-semibold text-pill">
                  {t.author.split(" ").map((n) => n[0]).join("")}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[0.85rem] font-medium text-ink">{t.author}</p>
                  <p className="text-[0.68rem] text-muted">{t.role}</p>
                </div>
              </div>
              <Toggle defaultOn={t.featured} label={`Feature ${t.author}`} />
            </div>

            <span className="mt-3 inline-flex items-center gap-0.5" aria-label={`${t.rating} of 5`}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={cn("size-3.5", i <= t.rating ? "text-warning" : "text-[#dedce6]")}
                  fill={i <= t.rating ? "currentColor" : "none"}
                />
              ))}
            </span>

            <blockquote className="mt-3 text-[0.82rem] leading-relaxed text-ink-2">
              “{t.quote}”
            </blockquote>

            <div className="mt-4 flex items-center justify-between border-t border-hairline pt-4">
              <Badge tone={t.featured ? "good" : "neutral"}>
                {t.featured ? "Featured" : "Hidden"}
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
