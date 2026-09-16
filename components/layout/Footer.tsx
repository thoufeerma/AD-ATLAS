import Link from "next/link";
import { Mail, Phone, Clock, MapPin, ArrowRight } from "lucide-react";
import {
  Instagram,
  Youtube,
  Facebook,
  XIcon,
  Pinterest,
} from "@/components/ui/SocialIcons";
import { STORE } from "@/lib/products";
import Logo from "./Logo";

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
      { label: "New Arrivals", href: "/shop?filter=new" },
      { label: "Offers", href: "/offers" },
      { label: "Gift Cards", href: "/offers#gift-cards" },
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

const SOCIALS = [
  { Icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { Icon: Youtube, href: "https://youtube.com", label: "YouTube" },
  { Icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { Icon: XIcon, href: "https://x.com", label: "X" },
  { Icon: Pinterest, href: "https://pinterest.com", label: "Pinterest" },
];

export default function Footer() {
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
          <div className="mt-6 flex items-center gap-3">
            {SOCIALS.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="grid size-8 place-items-center rounded-full border border-gold-500/40 text-gold-300 transition-colors hover:border-gold-400 hover:text-gold-200"
              >
                <Icon className="size-[15px]" />
              </a>
            ))}
          </div>
        </div>

        {COLUMNS.map((col) => (
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
              <a href={`mailto:${STORE.supportEmail}`} className="hover:text-gold-300">
                {STORE.supportEmail}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-gold-400" />
              <a href={`tel:${STORE.supportPhone.replace(/\s/g, "")}`} className="hover:text-gold-300">
                {STORE.supportPhone}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Clock className="mt-0.5 size-4 shrink-0 text-gold-400" />
              <span>{STORE.supportHours}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold-400" />
              <span>{STORE.city}</span>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="col-span-2 md:col-span-3 lg:col-span-3">
          <h3 className="label-caps mb-4 text-gold-300">Newsletter</h3>
          <p className="mb-4 text-sm leading-relaxed text-cream-200/70">
            Be the first to know about new launches &amp; exclusive offers.
          </p>
          <form className="space-y-3">
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>
            <input
              id="footer-email"
              type="email"
              placeholder="Enter your email address"
              className="w-full rounded-sm border border-gold-500/35 bg-plum-900/60 px-3.5 py-2.5 text-sm text-cream-100 placeholder:text-cream-200/40 focus:border-gold-400 focus:outline-none"
            />
            <button
              type="submit"
              className="label-caps flex w-full items-center justify-center gap-2 rounded-sm bg-gold-600 py-2.5 text-white transition-colors hover:bg-gold-500"
            >
              Subscribe <ArrowRight className="size-3.5" />
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-vel flex flex-col items-center justify-between gap-3 py-5 text-xs text-cream-200/55 sm:flex-row">
          <p>© {new Date().getFullYear()} Velastia. All Rights Reserved.</p>
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
