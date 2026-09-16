import type { Metadata } from "next";
import { Mail, Phone, Clock, MapPin, MessageCircle } from "lucide-react";
import PageBanner from "@/components/ui/PageBanner";
import Button from "@/components/ui/Button";
import TrustStrip from "@/components/ui/TrustStrip";
import { STORE } from "@/lib/products";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Questions, feedback or collaboration ideas — we'd love to hear from you.",
};

const CHANNELS = [
  { Icon: Mail, title: "Email", value: STORE.supportEmail, href: `mailto:${STORE.supportEmail}`, note: "We reply within 24 hrs" },
  { Icon: Phone, title: "Phone", value: STORE.supportPhone, href: `tel:${STORE.supportPhone.replace(/\s/g, "")}`, note: STORE.supportHours },
  { Icon: MessageCircle, title: "WhatsApp", value: "Chat with us", href: "https://wa.me/919876543210", note: "Fastest response" },
  { Icon: MapPin, title: "Studio", value: STORE.city, note: "AD Atlas Ventures Pvt Ltd" },
];

const SUBJECTS = [
  "Order enquiry",
  "Returns & refunds",
  "Product question",
  "Collaboration",
  "Something else",
];

export default function ContactPage() {
  return (
    <>
      <PageBanner
        title="Contact Us"
        tone="light"
        lead="Questions, feedback or collaboration ideas — we'd love to hear from you."
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <div className="container-vel grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Form */}
        <form className="rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-6 sm:p-8">
          <h2 className="font-display text-xl text-plum-800">Send us a message</h2>
          <p className="mt-1 text-[0.75rem] text-ink-soft">
            Fill this in and we&apos;ll get back to you by email.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field id="c-name" label="Full Name" placeholder="Your name" />
            <Field id="c-email" label="Email Address" type="email" placeholder="you@example.com" />
            <Field id="c-phone" label="Phone (optional)" placeholder="98765 43210" />
            <div>
              <label htmlFor="c-subject" className="label-caps mb-1.5 block text-[0.6rem] text-gold-700">
                Subject
              </label>
              <select
                id="c-subject"
                className="w-full rounded-sm border border-gold-200 bg-cream-50 px-3.5 py-2.5 text-sm text-plum-800 focus:border-gold-500 focus:outline-none"
              >
                {SUBJECTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="c-message" className="label-caps mb-1.5 block text-[0.6rem] text-gold-700">
                Message
              </label>
              <textarea
                id="c-message"
                rows={5}
                placeholder="Tell us how we can help…"
                className="w-full rounded-sm border border-gold-200 bg-cream-50 px-3.5 py-2.5 text-sm text-plum-800 placeholder:text-ink-soft/50 focus:border-gold-500 focus:outline-none"
              />
            </div>
          </div>

          <Button type="submit" size="lg" className="mt-6">
            Send Message
          </Button>
          <p className="mt-3 text-[0.68rem] text-ink-soft">
            Form submission is not wired to a backend yet — it lands in phase two.
          </p>
        </form>

        {/* Channels */}
        <aside className="space-y-4">
          {CHANNELS.map(({ Icon, title, value, href, note }) => (
            <div
              key={title}
              className="flex items-start gap-3.5 rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-5"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full border border-gold-300/70">
                <Icon className="size-4 text-gold-600" />
              </span>
              <div>
                <p className="label-caps text-[0.6rem] text-gold-700">{title}</p>
                {href ? (
                  <a href={href} className="mt-1 block text-sm text-plum-800 hover:text-gold-600">
                    {value}
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-plum-800">{value}</p>
                )}
                <p className="text-[0.68rem] text-ink-soft">{note}</p>
              </div>
            </div>
          ))}

          <div className="flex items-center gap-3 rounded-[var(--radius-card)] bg-plum-800 p-5">
            <Clock className="size-5 shrink-0 text-gold-400" />
            <p className="text-[0.72rem] leading-relaxed text-cream-200/75">
              Support hours
              <span className="block text-cream-50">{STORE.supportHours}</span>
            </p>
          </div>
        </aside>
      </div>

      <TrustStrip />
    </>
  );
}

function Field({
  id,
  label,
  type = "text",
  placeholder,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="label-caps mb-1.5 block text-[0.6rem] text-gold-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className="w-full rounded-sm border border-gold-200 bg-cream-50 px-3.5 py-2.5 text-sm text-plum-800 placeholder:text-ink-soft/50 focus:border-gold-500 focus:outline-none"
      />
    </div>
  );
}
