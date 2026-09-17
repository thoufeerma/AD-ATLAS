"use client";

import { Star } from "lucide-react";
import Badge from "@/components/ui/Badge";
import type { Banner, Faq, Offer, Testimonial } from "@/lib/api/types";
import { num } from "@/lib/utils";
import ResourceList from "./ResourceList";
import type { FieldSpec } from "./ResourceForm";

const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/* ── FAQs ─────────────────────────────────────────────────────────────── */

const FAQ_FIELDS: FieldSpec[] = [
  { name: "question", label: "Question", kind: "text", required: true, placeholder: "How long does delivery take?" },
  { name: "answer", label: "Answer", kind: "textarea", required: true },
  { name: "category", label: "Group", kind: "text", required: true, placeholder: "Shipping", hint: "FAQs are grouped by this on the storefront" },
  { name: "sortOrder", label: "Order within group", kind: "int", defaultValue: "0" },
  { name: "isPublished", label: "Published", kind: "checkbox", defaultValue: true },
];

export function FaqsManager({ faqs }: { faqs: Faq[] }) {
  return (
    <ResourceList
      items={faqs}
      fields={FAQ_FIELDS}
      basePath="/admin/faqs"
      toggle={{ field: "isPublished", label: "Published" }}
      title={(f) => f.question}
      subtitle={(f) => <span className="line-clamp-2">{f.answer}</span>}
      meta={(f) => !f.isPublished && <Badge tone="neutral">Hidden</Badge>}
      groupBy={(f) => f.category}
      listTitle="All Questions"
      createTitle="Add Question"
      emptyText="No FAQs yet."
    />
  );
}

/* ── Testimonials ─────────────────────────────────────────────────────── */

const TESTIMONIAL_FIELDS: FieldSpec[] = [
  { name: "author", label: "Name", kind: "text", required: true, placeholder: "Ananya S." },
  { name: "role", label: "Role", kind: "text", required: true, defaultValue: "Verified Buyer" },
  { name: "rating", label: "Rating", kind: "rating", defaultValue: "5" },
  { name: "quote", label: "Quote", kind: "textarea", required: true },
  { name: "avatarUrl", label: "Photo", kind: "text", placeholder: "/people/malvika.png", hint: "Image path or URL" },
  { name: "sortOrder", label: "Order", kind: "int", defaultValue: "0" },
  { name: "isFeatured", label: "Feature on homepage", kind: "checkbox", defaultValue: false },
];

export function TestimonialsManager({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <ResourceList
      items={testimonials}
      fields={TESTIMONIAL_FIELDS}
      basePath="/admin/testimonials"
      toggle={{ field: "isFeatured", label: "Featured on homepage" }}
      title={(t) => t.author}
      subtitle={(t) => <span className="italic">“{t.quote}”</span>}
      meta={(t) => (
        <>
          <span className="inline-flex items-center gap-0.5" aria-label={`${t.rating} of 5 stars`}>
            {Array.from({ length: t.rating }, (_, i) => (
              <Star key={i} className="size-3 text-warning" fill="currentColor" />
            ))}
          </span>
          <span className="text-[0.7rem] text-muted">{t.role}</span>
          {t.isFeatured && <Badge tone="good">Featured</Badge>}
        </>
      )}
      listTitle="All Testimonials"
      createTitle="Add Testimonial"
      emptyText="No testimonials yet."
    />
  );
}

/* ── Banners ──────────────────────────────────────────────────────────── */

const BANNER_FIELDS: FieldSpec[] = [
  { name: "name", label: "Internal Name", kind: "text", required: true, placeholder: "Diwali hero" },
  { name: "placement", label: "Placement", kind: "text", required: true, placeholder: "home.hero", hint: "Where it shows, e.g. home.hero, global.topbar, cart.inline" },
  { name: "headline", label: "Headline", kind: "text" },
  { name: "imageUrl", label: "Image", kind: "text", placeholder: "/brand/hero-products.png" },
  { name: "href", label: "Links To", kind: "text", placeholder: "/shop" },
  { name: "sortOrder", label: "Order", kind: "int", defaultValue: "0" },
  { name: "isActive", label: "Live", kind: "checkbox", defaultValue: true },
];

export function BannersManager({ banners }: { banners: Banner[] }) {
  return (
    <ResourceList
      items={banners}
      fields={BANNER_FIELDS}
      basePath="/admin/banners"
      toggle={{ field: "isActive", label: "Live" }}
      title={(b) => b.name}
      subtitle={(b) => b.headline ?? <span className="text-muted">No headline</span>}
      meta={(b) => (
        <>
          <Badge tone="neutral" dot={false}>{b.placement}</Badge>
          {b.href && <span className="text-[0.7rem] text-muted">→ {b.href}</span>}
          <span className="tnum text-[0.7rem] text-muted">{num(b.clicks)} clicks</span>
        </>
      )}
      listTitle="All Banners"
      createTitle="Add Banner"
      emptyText="No banners yet."
    />
  );
}

/* ── Offers ───────────────────────────────────────────────────────────── */

const OFFER_FIELDS: FieldSpec[] = [
  { name: "name", label: "Offer Name", kind: "text", required: true, placeholder: "Buy 2 Get 1 Free" },
  { name: "scope", label: "Applies To", kind: "text", required: true, placeholder: "All full-priced products" },
  { name: "startsAt", label: "Starts", kind: "dateStart", required: true },
  { name: "endsAt", label: "Ends", kind: "dateEnd", required: true, hint: "Runs through the end of this day" },
  { name: "isActive", label: "Running", kind: "checkbox", defaultValue: true },
];

function offerState(o: Offer) {
  const now = Date.now();
  if (!o.isActive) return { label: "Paused", tone: "neutral" as const };
  if (new Date(o.startsAt).getTime() > now) return { label: "Scheduled", tone: "warning" as const };
  if (new Date(o.endsAt).getTime() < now) return { label: "Ended", tone: "critical" as const };
  return { label: "Running", tone: "good" as const };
}

export function OffersManager({ offers }: { offers: Offer[] }) {
  return (
    <ResourceList
      items={offers}
      fields={OFFER_FIELDS}
      basePath="/admin/offers"
      toggle={{ field: "isActive", label: "Running" }}
      title={(o) => o.name}
      subtitle={(o) => o.scope}
      meta={(o) => {
        const s = offerState(o);
        return (
          <>
            <Badge tone={s.tone}>{s.label}</Badge>
            <span className="text-[0.7rem] text-muted">
              {day(o.startsAt)} – {day(o.endsAt)}
            </span>
          </>
        );
      }}
      listTitle="All Offers"
      createTitle="Add Offer"
      emptyText="No offers yet."
    />
  );
}
