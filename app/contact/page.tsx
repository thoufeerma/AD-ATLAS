import type { Metadata } from "next";
import { Mail, Phone, Clock, MapPin, MessageCircle } from "lucide-react";
import PageBanner from "@/components/ui/PageBanner";
import TrustStrip from "@/components/ui/TrustStrip";
import ContactForm from "@/components/forms/ContactForm";
import { getSettings } from "@/lib/api/server";
import { telHref, whatsappHref } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Questions, feedback or collaboration ideas — we'd love to hear from you.",
};

export default async function ContactPage() {
  const { store } = await getSettings();
  const channels = [
    { Icon: Mail, title: "Email", value: store.supportEmail, href: `mailto:${store.supportEmail}`, note: "We reply within 24 hrs" },
    { Icon: Phone, title: "Phone", value: store.supportPhone, href: telHref(store.supportPhone), note: store.supportHours },
    { Icon: MessageCircle, title: "WhatsApp", value: "Chat with us", href: whatsappHref(store.supportPhone), note: "Fastest response" },
    { Icon: MapPin, title: "Studio", value: store.city, note: store.legalEntity },
  ];

  return (
    <>
      <PageBanner
        title="Contact Us"
        tone="light"
        lead="Questions, feedback or collaboration ideas — we'd love to hear from you."
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <div className="container-vel grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_340px]">
        <ContactForm />

        {/* Channels */}
        <aside className="space-y-4">
          {channels.map(({ Icon, title, value, href, note }) => (
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
              <span className="block text-cream-50">{store.supportHours}</span>
            </p>
          </div>
        </aside>
      </div>

      <TrustStrip />
    </>
  );
}
