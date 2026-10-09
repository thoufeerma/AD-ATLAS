import Image from "next/image";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { socialProfiles } from "@/components/ui/SocialIcons";
import { Mastercard, Paytm, Upi, Visa } from "@/components/ui/PaymentLogos";
import { getSettings } from "@/lib/api/server";
import { FooterBar } from "./Footer";
import NewsletterForm from "./NewsletterForm";

/** Gold column headings and cream links, as in the shop footer design. */
const HEADING = "mb-3 font-display text-[1.15rem] font-semibold uppercase tracking-wide text-gold-400";
const LINK = "text-[0.95rem] text-cream-50/95 transition-colors hover:text-gold-300";
/**
 * Every column after the first: its content set in from a thin rule that
 * starts below the heading line and stops short of the last link, as drawn.
 */
const DIVIDED =
  "relative xl:pl-12 xl:before:absolute xl:before:left-0 xl:before:top-8 xl:before:bottom-8 xl:before:w-px xl:before:bg-white/15";

const COLUMNS = [
  {
    title: "SHOP",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "Best Sellers", href: "/shop?category=best-sellers" },
      { label: "New Arrivals", href: "/shop?category=new-arrivals" },
      { label: "Offers", href: "/shop?category=offers" },
      { label: "Gift Cards", href: "/gift-cards" },
    ],
  },
  {
    title: "HELP",
    links: [
      { label: "FAQ", href: "/faqs" },
      { label: "Shipping & Delivery", href: "/shipping" },
      { label: "Return & Refunds", href: "/returns" },
      { label: "Track Order", href: "/track-order" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "ABOUT",
    links: [
      { label: "Our Story", href: "/about" },
      { label: "Ingredients", href: "/ingredients" },
      { label: "Reviews", href: "/reviews" },
      { label: "Collabs", href: "/collabs" },
    ],
  },
];

/** The shop page's footer: brand, three link columns, and the newsletter. */
export default async function ShopFooter() {
  const { store } = await getSettings();
  const socials = socialProfiles(store.social);

  return (
    <footer className="bg-[#20082d] text-cream-100">
      <div className="container-vel grid grid-cols-1 gap-10 pt-7 pb-4 sm:grid-cols-3 xl:grid-cols-[1.4fr_0.9fr_1fr_0.8fr_1.2fr_1.6fr] xl:gap-0">
        {/* Brand */}
        <div className="sm:col-span-3 xl:col-span-1 xl:pr-6">
          <Image
            src="/brand/footer-logo-light.png"
            alt={store.name}
            width={900}
            height={297}
            className="h-[4.5rem] w-auto"
          />
          <p className="mt-4 max-w-[17rem] text-[0.95rem] leading-[1.6] text-cream-50/95">
            Clean beauty backed by science and made to make you feel beautiful, every day.
          </p>
          <div className="mt-6 flex items-center gap-4">
            {socials.length > 0 && socials.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={`Velastia on ${label}`}
                target="_blank"
                rel="noopener noreferrer"
                className="grid size-8 place-items-center rounded-full border-[1px] border-gold-400/80 text-cream-50 transition-colors hover:border-gold-300 hover:text-gold-300"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title} className={DIVIDED}>
            <h3 className={HEADING}>{col.title}</h3>
            <ul className="space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className={LINK}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contact Info */}
        <div className={DIVIDED}>
          <h3 className={HEADING}>CONTACT</h3>
          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c8963c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <span className={LINK}>hello@velastia.com</span>
            </li>
            <li className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c8963c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span className={LINK}>+91 98765 43210</span>
            </li>
            <li className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c8963c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span className={LINK}>(Mon - Sat | 10AM - 7PM)</span>
            </li>
            <li className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c8963c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <span className={LINK}>Mumbai, India</span>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className={`${DIVIDED} sm:col-span-3 xl:col-span-1`}>
          <h3 className={HEADING}>NEWSLETTER</h3>
          <p className="max-w-[16rem] text-[0.95rem] leading-[1.6] text-cream-50/95">
            Be the first to know about new launches & exclusive offers.
          </p>
          <div className="mt-4">
            <NewsletterForm variant="arrow" />
          </div>
        </div>
      </div>

      <FooterBar storeName={store.name} />
    </footer>
  );
}
