"use client";

import { Save, Globe, Share2, FileCode } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Toggle from "@/components/ui/Toggle";

export default function SeoPage() {
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <PageHeader
        title="SEO Settings"
        subtitle="Defaults applied to any page that does not set its own metadata"
        actions={
          <Button size="sm" type="submit">
            <Save className="size-3.5" /> Save Changes
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Site Metadata">
          <div className="space-y-4">
            <Field
              label="Default Title"
              defaultValue="Velastia — Luxury. Science. You."
              Icon={Globe}
            />
            <div>
              <Label>Default Description</Label>
              <textarea
                rows={3}
                defaultValue="Premium beauty, crafted with science and designed for the modern Indian woman. Clean, cruelty-free and dermatologically tested."
                className="w-full rounded-lg border border-hairline bg-card px-3.5 py-2.5 text-[0.8rem] text-ink focus:border-series-1 focus:outline-none"
              />
              <p className="mt-1.5 text-[0.68rem] text-muted">
                Aim for 150–160 characters. Currently 148.
              </p>
            </div>
            <Field label="Canonical Domain" defaultValue="https://velastia.com" />
            <Field label="Title Separator" defaultValue="|" />
          </div>
        </Card>

        <Card title="Social Sharing">
          <div className="space-y-4">
            <Field label="Open Graph Title" defaultValue="Velastia — Luxury. Science. You." Icon={Share2} />
            <Field label="Twitter Handle" defaultValue="@velastia.beauty" />
            <div>
              <Label>Default Share Image</Label>
              <div className="grid place-items-center rounded-xl border border-dashed border-hairline bg-plane px-4 py-8 text-center">
                <p className="text-[0.76rem] text-ink">og-default.png</p>
                <p className="mt-1 text-[0.68rem] text-muted">1200 × 630 recommended</p>
                <Button type="button" variant="outline" size="sm" className="mt-3">
                  Replace Image
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Indexing">
          <ul className="space-y-4">
            {[
              { label: "Allow search engines to index the storefront", on: true },
              { label: "Generate sitemap.xml automatically", on: true },
              { label: "Include blog posts in the sitemap", on: true },
              { label: "Add structured data for products", on: true },
              { label: "Noindex out-of-stock products", on: false },
            ].map((r) => (
              <li key={r.label} className="flex items-center justify-between gap-4">
                <span className="text-[0.78rem] text-ink-2">{r.label}</span>
                <Toggle defaultOn={r.on} label={r.label} />
              </li>
            ))}
          </ul>
        </Card>

        <Card title="robots.txt">
          <div className="flex items-center gap-2 pb-2 text-[0.7rem] text-muted">
            <FileCode className="size-3.5" /> Served at /robots.txt
          </div>
          <textarea
            rows={8}
            spellCheck={false}
            defaultValue={`User-agent: *\nAllow: /\nDisallow: /cart\nDisallow: /checkout\nDisallow: /order-success\n\nSitemap: https://velastia.com/sitemap.xml`}
            className="tnum w-full rounded-lg border border-hairline bg-plane px-3.5 py-2.5 font-mono text-[0.72rem] leading-relaxed text-ink focus:border-series-1 focus:outline-none"
          />
        </Card>
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
  defaultValue,
  Icon,
}: {
  label: string;
  defaultValue?: string;
  Icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2.5 rounded-lg border border-hairline bg-card px-3.5 focus-within:border-series-1">
        {Icon && <Icon className="size-4 shrink-0 text-muted" />}
        <input
          defaultValue={defaultValue}
          className="w-full bg-transparent py-2.5 text-[0.8rem] text-ink focus:outline-none"
        />
      </div>
    </div>
  );
}
