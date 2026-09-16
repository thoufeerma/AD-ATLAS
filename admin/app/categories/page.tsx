"use client";

import { Plus, GripVertical, Pencil, Trash2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Toggle from "@/components/ui/Toggle";
import { CATEGORIES } from "@/lib/mock";

export default function CategoriesPage() {
  return (
    <>
      <PageHeader
        title="Categories"
        subtitle={`${CATEGORIES.length} categories · drag to reorder how they appear on the shop page`}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card title="All Categories" bodyClassName="p-0">
          <ul className="divide-y divide-hairline">
            {CATEGORIES.map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-5 py-4">
                <GripVertical className="size-4 shrink-0 cursor-grab text-muted" />
                <div className="min-w-0 flex-1">
                  <p className="text-[0.85rem] font-medium text-ink">{c.name}</p>
                  <p className="text-[0.68rem] text-muted">/shop?category={c.slug}</p>
                </div>
                <Badge tone="neutral" dot={false}>
                  {c.products} products
                </Badge>
                <Toggle defaultOn={c.visible} label={`Show ${c.name} on storefront`} />
                <button
                  aria-label={`Edit ${c.name}`}
                  className="grid size-8 place-items-center rounded-lg border border-hairline text-muted hover:border-series-1 hover:text-series-1"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  aria-label={`Delete ${c.name}`}
                  className="grid size-8 place-items-center rounded-lg border border-hairline text-muted hover:border-critical hover:text-critical"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Add Category">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label
                htmlFor="cat-name"
                className="mb-1.5 block text-[0.7rem] font-medium text-ink-2"
              >
                Name *
              </label>
              <input
                id="cat-name"
                placeholder="Fragrance"
                className="w-full rounded-lg border border-hairline bg-card px-3.5 py-2.5 text-[0.8rem] text-ink placeholder:text-muted focus:border-series-1 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="cat-slug"
                className="mb-1.5 block text-[0.7rem] font-medium text-ink-2"
              >
                Slug
              </label>
              <input
                id="cat-slug"
                placeholder="fragrance"
                className="w-full rounded-lg border border-hairline bg-card px-3.5 py-2.5 text-[0.8rem] text-ink placeholder:text-muted focus:border-series-1 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="cat-desc"
                className="mb-1.5 block text-[0.7rem] font-medium text-ink-2"
              >
                Description
              </label>
              <textarea
                id="cat-desc"
                rows={3}
                placeholder="Shown on the category landing page"
                className="w-full rounded-lg border border-hairline bg-card px-3.5 py-2.5 text-[0.8rem] text-ink placeholder:text-muted focus:border-series-1 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[0.78rem] text-ink-2">Visible on storefront</span>
              <Toggle defaultOn label="Visible on storefront" />
            </div>
            <Button type="submit" className="w-full">
              <Plus className="size-3.5" /> Create Category
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
}
