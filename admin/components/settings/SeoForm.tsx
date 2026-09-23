"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ImageField } from "@/components/media/MediaPicker";
import { api, ApiError } from "@/lib/api/client";
import { SEO_PAGES, type SeoPage, type SeoSettings } from "@/lib/api/types";
import { cn, same } from "@/lib/utils";

const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL ?? "http://localhost:3000";

/** Google shows roughly this much; longer isn't wrong, it's just cut off. */
const GOOD_TITLE = 60;
const GOOD_DESCRIPTION = 160;

const inputCls = (error?: string) =>
  cn(
    "w-full rounded-lg border bg-card px-3.5 py-2.5 text-[0.8rem] text-ink placeholder:text-muted focus:outline-none",
    error ? "border-critical" : "border-hairline focus:border-series-1",
  );

export default function SeoForm({ initial, editable }: { initial: SeoSettings; editable: boolean }) {
  const router = useRouter();
  const [values, setValues] = useState<SeoSettings>(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  const dirty = !same(values, initial);
  const set = <K extends keyof SeoSettings>(key: K, value: SeoSettings[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setSaved(false);
  };
  const setPage = (page: SeoPage, part: "title" | "description", value: string) => {
    setValues((v) => ({ ...v, pages: { ...v.pages, [page]: { ...v.pages[page], [part]: value } } }));
    setSaved(false);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setFields({});
    try {
      await api("PUT", "/admin/settings/seo", values);
      setSaved(true);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setFields(err.fields);
        setError(Object.keys(err.fields).length ? "Fix the highlighted fields." : err.message);
      } else {
        setError("Couldn't save. Try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Site Defaults">
          <div className="space-y-4">
            <Field
              label="Site Title"
              hint="The home page's title, and the fallback anywhere else."
              value={values.defaultTitle}
              error={fields.defaultTitle}
              limit={GOOD_TITLE}
              disabled={!editable}
              onChange={(v) => set("defaultTitle", v)}
            />
            <Field
              label="Title Ending"
              hint={`Added after every other page's title: "Shop Collection | ${values.titleSuffix || "…"}".`}
              value={values.titleSuffix}
              error={fields.titleSuffix}
              disabled={!editable}
              onChange={(v) => set("titleSuffix", v)}
            />
            <Field
              label="Site Description"
              hint="The line under the title in search results. Around 150 characters reads best."
              value={values.description}
              error={fields.description}
              limit={GOOD_DESCRIPTION}
              textarea
              disabled={!editable}
              onChange={(v) => set("description", v)}
            />
            <label className="block">
              <span className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">Share Image</span>
              <ImageField
                label="Share image"
                value={values.shareImageUrl ?? ""}
                onChange={(url) => set("shareImageUrl", url || null)}
                invalid={!!fields.shareImageUrl}
              />
              <span className="mt-1 block text-[0.68rem] text-muted">
                Shown when someone shares a link on WhatsApp, Instagram or X. 1200 × 630 works everywhere.
                Product pages use their own photo.
              </span>
            </label>
          </div>
        </Card>

        <div className="space-y-5">
          <Card title="Search Engines">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={values.indexable}
                disabled={!editable}
                onChange={(e) => set("indexable", e.target.checked)}
                className="mt-0.5 size-4 accent-series-1"
              />
              <span className="text-[0.78rem] leading-tight text-ink">
                Let search engines list the store
                <span className="mt-0.5 block text-[0.68rem] leading-relaxed text-muted">
                  Off until you launch: every page tells Google and the rest to stay away, so a test copy
                  never turns up in search. Turning it on also publishes the sitemap of your pages and
                  products.
                </span>
              </span>
            </label>
            <p
              className={cn(
                "mt-4 rounded-lg px-3.5 py-2.5 text-[0.72rem] leading-relaxed",
                values.indexable ? "bg-good/10 text-ink" : "bg-plane text-ink-2",
              )}
            >
              {values.indexable
                ? "Search engines are welcome. It can still take days or weeks for pages to appear in results."
                : "The store is hidden from search. Cart, checkout, account and search pages stay hidden either way."}
            </p>
          </Card>

          <Card title="How It Looks">
            <Preview
              title={values.defaultTitle || "Your site title"}
              description={values.description || "Your site description"}
              path=""
            />
          </Card>
        </div>
      </div>

      <Card title="Page Titles & Descriptions" bodyClassName="p-0">
        <ul className="divide-y divide-hairline">
          {SEO_PAGES.map((page) => {
            const meta = values.pages[page];
            return (
              <li key={page} className="grid gap-4 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div className="space-y-3">
                  <p className="text-[0.8rem] font-medium text-ink">
                    {PAGE_LABEL[page]}
                    <span className="ml-2 font-normal text-muted">/{page === "home" ? "" : page}</span>
                  </p>
                  <Field
                    label="Title"
                    value={meta.title}
                    error={fields[`pages.${page}.title`]}
                    limit={GOOD_TITLE}
                    placeholder={page === "home" ? "Uses the site title" : ""}
                    disabled={!editable}
                    onChange={(v) => setPage(page, "title", v)}
                  />
                  <Field
                    label="Description"
                    value={meta.description}
                    error={fields[`pages.${page}.description`]}
                    limit={GOOD_DESCRIPTION}
                    placeholder={page === "home" ? "Uses the site description" : ""}
                    textarea
                    disabled={!editable}
                    onChange={(v) => setPage(page, "description", v)}
                  />
                </div>
                <div className="lg:pt-7">
                  <Preview
                    title={
                      (meta.title || values.defaultTitle) +
                      (meta.title && values.titleSuffix ? ` | ${values.titleSuffix}` : "")
                    }
                    description={meta.description || values.description}
                    path={page === "home" ? "" : `/${page}`}
                  />
                </div>
              </li>
            );
          })}
        </ul>
        <p className="border-t border-hairline px-5 py-3 text-[0.7rem] leading-relaxed text-muted">
          Products have their own title and description on each product page, and the shipping, returns,
          terms and privacy pages have theirs under Pages.
        </p>
      </Card>

      {editable && (
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="sm" disabled={busy || !dirty}>
            {busy && <Loader2 className="size-3.5 animate-spin" />}
            {busy ? "Saving…" : "Save Changes"}
          </Button>
          {error ? (
            <span role="alert" className="flex items-center gap-1.5 text-[0.72rem] text-critical">
              <AlertCircle className="size-3.5" /> {error}
            </span>
          ) : saved && !dirty ? (
            <span role="status" className="flex items-center gap-1.5 text-[0.72rem] text-good">
              <Check className="size-3.5" /> Saved — live on the store within a minute
            </span>
          ) : null}
        </div>
      )}
    </form>
  );
}

const PAGE_LABEL: Record<SeoPage, string> = {
  home: "Home",
  shop: "Shop",
  about: "About",
  offers: "Offers",
  collabs: "Collaborations",
  reviews: "Reviews",
  faqs: "FAQs",
  ingredients: "Ingredients",
  contact: "Contact",
  "track-order": "Track Order",
  blog: "Journal",
};

/** Roughly what a search result looks like, to judge length by eye. */
function Preview({ title, description, path }: { title: string; description: string; path: string }) {
  const host = STORE_URL.replace(/^https?:\/\//, "");
  return (
    <div className="rounded-lg border border-hairline bg-plane px-3.5 py-3">
      <p className="truncate text-[0.68rem] text-muted">
        {host}
        {path}
      </p>
      <p className="mt-0.5 truncate text-[0.88rem] text-series-1">{title}</p>
      <p className="mt-0.5 line-clamp-2 text-[0.72rem] leading-relaxed text-ink-2">{description}</p>
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  error,
  limit,
  placeholder,
  textarea,
  disabled,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  error?: string;
  /** The length search engines show; over it, the field says so. */
  limit?: number;
  placeholder?: string;
  textarea?: boolean;
  disabled: boolean;
  onChange: (v: string) => void;
}) {
  const over = limit != null && value.length > limit;
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-[0.7rem] font-medium text-ink-2">{label}</span>
        {limit != null && value.length > 0 && (
          <span className={cn("tnum text-[0.66rem]", over ? "text-[#8a5d00]" : "text-muted")}>
            {value.length}/{limit}
          </span>
        )}
      </span>
      {textarea ? (
        <textarea
          value={value}
          rows={3}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls(error)}
        />
      ) : (
        <input
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls(error)}
        />
      )}
      {error ? (
        <span className="mt-1 block text-[0.7rem] text-critical">{error}</span>
      ) : over ? (
        <span className="mt-1 block text-[0.68rem] text-muted">Longer than search results show — it&apos;ll be cut off.</span>
      ) : hint ? (
        <span className="mt-1 block text-[0.68rem] text-muted">{hint}</span>
      ) : null}
    </label>
  );
}
