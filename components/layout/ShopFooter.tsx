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
      { label: "Lipstick", href: "/shop?category=lipstick" },
      { label: "Lip Care", href: "/shop?category=lip-care" },
      { label: "Face", href: "/shop?category=face" },
      { label: "Skincare", href: "/shop?category=skincare" },
      { label: "Accessories", href: "/shop?category=accessories" },
      { label: "Perfume", href: "/shop?category=perfume" },
    ],
  },
  {
    title: "CUSTOMER CARE",
    links: [
      { label: "FAQs", href: "/faqs" },
      { label: "Shipping & Delivery", href: "/shipping" },
      { label: "Returns & Refunds", href: "/returns" },
      { label: "Track Order", href: "/track-order" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
  {
    title: "ABOUT",
    links: [
      { label: "About Velastia", href: "/about" },
      { label: "Our Ingredients", href: "/ingredients" },
      { label: "Reviews", href: "/reviews" },
      { label: "Collaboration", href: "/collabs" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
];

/** The shop page's footer: brand, three link columns, and the newsletter. */
export default async function ShopFooter() {
  const { store } = await getSettings();
  const socials = socialProfiles(store.social);

  return (
    <footer className="bg-[#371938] text-cream-100">
      <div className="container-vel grid grid-cols-1 gap-10 pt-7 pb-4 sm:grid-cols-3 xl:grid-cols-[1.2fr_1fr_1.2fr_1fr_1.75fr] xl:gap-0">
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
            Premium luxury cosmetics crafted with science and designed for the modern Indian woman.
          </p>
          {socials.length > 0 && (
            <div className="mt-5 flex items-center gap-5">
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={`Velastia on ${label}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid size-10 place-items-center rounded-full border-[1.5px] border-gold-400 text-cream-50 transition-colors hover:border-gold-300 hover:text-gold-300"
                >
                  <Icon className="size-5" />
                </a>
              ))}
            </div>
          )}
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title} className={DIVIDED}>
            <h3 className={HEADING}>{col.title}</h3>
            <ul className="space-y-1">
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

        {/* Newsletter */}
        <div className={`${DIVIDED} sm:col-span-3 xl:col-span-1`}>
          <h3 className={HEADING}>NEWSLETTER</h3>
          <p className="max-w-[16rem] text-[0.95rem] leading-[1.6] text-cream-50/95">
            Subscribe to get exclusive offers and beauty tips.
          </p>
          <div className="mt-4">
            <NewsletterForm variant="arrow" />
          </div>
          <div className="mt-6 flex max-w-[25rem] items-center justify-between gap-2 xl:max-w-none">
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="grid size-8 place-items-center rounded-full border-[1.5px] border-gold-400 text-gold-400">
                <LockKeyhole className="size-4" strokeWidth={1.75} />
              </span>
              <span className="text-[0.62rem] font-semibold uppercase leading-tight text-cream-50">
                100% Secure
                <br />
                Payments
              </span>
            </div>
            <Visa className="h-5 w-[3rem] shrink-0" />
            <Mastercard named className="h-8 w-10 shrink-0" />
            <Upi className="h-5 w-[2.9rem] shrink-0" />
            <Paytm className="h-7 w-11 shrink-0" />
          </div>
        </div>
      </div>

      <FooterBar storeName={store.name} />
    </footer>
  );
}
