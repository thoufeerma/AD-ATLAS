import Link from "next/link";
import { Mail, Phone, Clock, MapPin } from "lucide-react";
import { socialProfiles } from "@/components/ui/SocialIcons";
import { getBlogPosts, getSettings } from "@/lib/api/server";
import { telHref } from "@/lib/utils";
import Logo from "./Logo";
import NewsletterForm from "./NewsletterForm";

/**
 * Gen B (2025) footer: five link columns with a contact block, matching
 * M-Cart / Q-Wishlist / N-Order-Success.
 */
const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "Best Sellers", href: "/shop?filter=bestsellers" },
      { label: "Coming Soon", href: "/shop?filter=coming-soon" },
      { label: "Offers", href: "/offers" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "FAQ", href: "/faqs" },
      { label: "Shipping & Delivery", href: "/shipping" },
      { label: "Return & Refunds", href: "/returns" },
      { label: "Track Order", href: "/track-order" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Our Story", href: "/about" },
      { label: "Ingredients", href: "/ingredients" },
      { label: "Reviews", href: "/reviews" },
      { label: "Collabs", href: "/collabs" },
    ],
  },
];

export default async function Footer() {
  const [{ store }, posts] = await Promise.all([getSettings(), getBlogPosts(1)]);
  const socials = socialProfiles(store.social);
  // The Journal is only linked once something is published in the admin.
  const columns = COLUMNS.map((col) =>
    col.title === "About" && posts.length > 0
      ? { ...col, links: [...col.links, { label: "Journal", href: "/blog" }] }
      : col,
  );

  return (
    <footer className="mt-20 bg-plum-800 text-cream-100">
      <div className="container-vel grid grid-cols-2 gap-x-8 gap-y-10 py-14 md:grid-cols-3 lg:grid-cols-12">
        {/* Brand */}
        <div className="col-span-2 md:col-span-3 lg:col-span-3">
          <Logo tone="light" />
          <p className="mt-5 max-w-[15rem] text-sm leading-relaxed text-cream-200/70">
            Clean beauty backed by science and made to make you feel beautiful,
            every day.
          </p>
          {socials.length > 0 && (
            <div className="mt-6 flex items-center gap-3">
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={`Velastia on ${label}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid size-8 place-items-center rounded-full border border-gold-500/40 text-gold-300 transition-colors hover:border-gold-400 hover:text-gold-200"
                >
                  <Icon className="size-[15px]" />
                </a>
              ))}
            </div>
          )}
        </div>

        {columns.map((col) => (
          <div key={col.title} className="lg:col-span-2">
            <h3 className="label-caps mb-4 text-gold-300">{col.title}</h3>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-cream-200/70 transition-colors hover:text-gold-300"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contact */}
        <div className="lg:col-span-2">
          <h3 className="label-caps mb-4 text-gold-300">Contact</h3>
          <ul className="space-y-3 text-sm text-cream-200/70">
            <li className="flex items-start gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-gold-400" />
              <a href={`mailto:${store.supportEmail}`} className="hover:text-gold-300">
                {store.supportEmail}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-gold-400" />
              <a href={telHref(store.supportPhone)} className="hover:text-gold-300">
                {store.supportPhone}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Clock className="mt-0.5 size-4 shrink-0 text-gold-400" />
              <span>{store.supportHours}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold-400" />
              <span>{store.city}</span>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="col-span-2 md:col-span-3 lg:col-span-3">
          <h3 className="label-caps mb-4 text-gold-300">Newsletter</h3>
          <p className="mb-4 text-sm leading-relaxed text-cream-200/70">
            Be the first to know about new launches &amp; exclusive offers.
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-vel flex flex-col items-center justify-between gap-3 py-5 text-xs text-cream-200/55 sm:flex-row">
          <p>© {new Date().getFullYear()} {store.name}. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-gold-300">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-gold-300">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
