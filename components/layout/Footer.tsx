import Link from "next/link";
import { socialProfiles } from "@/components/ui/SocialIcons";
import { Amex, Mastercard, Paytm, Upi, Visa } from "@/components/ui/PaymentLogos";
import { getSettings } from "@/lib/api/server";
import NewsletterForm from "./NewsletterForm";

/** Column headings and links, shared by the three link columns. */
const HEADING = "mb-2.5 font-display text-[1.2rem] font-bold uppercase tracking-wide text-cream-50";
const LINK = "text-[0.95rem] text-cream-100/90 transition-colors hover:text-gold-300";
/** The thin rule between columns on wide screens. */
const DIVIDED = "lg:border-l lg:border-white/15 lg:pl-10";

const COLUMNS = [
  {
    title: "SHOP",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "Lipstick", href: "/shop?category=lipstick" },
      { label: "Liquid Lipstick", href: "/shop?category=liquid-lipstick" },
      { label: "Face", href: "/shop?category=face" },
      { label: "Skincare", href: "/shop?category=skincare" },
      { label: "Accessories", href: "/shop?category=accessories" },
    ],
  },
  {
    title: "CUSTOMER CARE",
    links: [
      { label: "FAQs", href: "/faqs" },
      { label: "Shipping & Delivery", href: "/shipping" },
      { label: "Returns & Refunds", href: "/returns" },
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
      { label: "Collaborations", href: "/collabs" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
];

/** The payment marks, as drawn in the footer design. */
const ACCEPTED = [
  { label: "Visa", Logo: Visa, size: "h-7 w-[4.25rem]" },
  { label: "Mastercard", Logo: Mastercard, size: "h-9 w-14" },
  { label: "UPI", Logo: Upi, size: "h-7 w-[4.25rem]" },
  { label: "American Express", Logo: Amex, size: "h-9 w-14" },
  { label: "Paytm", Logo: Paytm, size: "h-9 w-14" },
];

export default async function Footer() {
  const { store } = await getSettings();
  const socials = socialProfiles(store.social);

  return (
    <footer className="bg-[#371938] text-cream-100">
      <div className="container-vel grid grid-cols-1 gap-10 pt-8 pb-5 sm:grid-cols-3 lg:grid-cols-[2.4fr_1fr_1.3fr_1.15fr_1.6fr] lg:gap-0">
        {/* Newsletter & Socials */}
        <div className="sm:col-span-3 lg:col-span-1 lg:pr-7">
          <h2 className="font-display text-[1.75rem] leading-tight uppercase tracking-[0.02em] text-gold-400 xl:text-[1.9rem]">
            SUBSCRIBE & GET 10% OFF
          </h2>
          <p className="mt-2.5 max-w-[21rem] text-[1rem] leading-[1.65] text-cream-100/95">
            Join our community and get exclusive offers, beauty tips & new product updates.
          </p>
          <div className="mt-4">
            <NewsletterForm />
          </div>
          {socials.length > 0 && (
            <div className="mt-4 flex items-center gap-5">
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
            <ul className="space-y-1.5">
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

        {/* We Accept */}
        <div className={`${DIVIDED} sm:col-span-3 lg:col-span-1 lg:text-center`}>
          <h3 className="mb-4 font-sans text-[1.15rem] uppercase tracking-wide text-cream-50">WE ACCEPT</h3>
          <ul className="inline-grid grid-cols-3 items-center justify-items-center gap-x-6 gap-y-3">
            {ACCEPTED.map(({ label, Logo, size }) => (
              <li key={label}>
                <Logo className={size} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <FooterBar storeName={store.name} />
    </footer>
  );
}

/** The copyright row along the bottom, shared with the shop page's footer. */
export function FooterBar({ storeName }: { storeName: string }) {
  return (
    <div className="border-t border-white/15">
      <div className="container-vel flex flex-col items-center justify-between gap-2 py-3.5 text-[0.95rem] text-cream-100/90 sm:flex-row">
        <p>© {new Date().getFullYear()} {storeName}. All Rights Reserved.</p>
        <p>
          Made with <span className="px-1 text-gold-500">💛</span> in India
        </p>
      </div>
    </div>
  );
}
