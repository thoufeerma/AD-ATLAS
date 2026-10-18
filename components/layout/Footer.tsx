import Image from "next/image";
import Link from "next/link";
import { socialProfiles } from "@/components/ui/SocialIcons";
import { Amex, Mastercard, Paytm, Upi, Visa } from "@/components/ui/PaymentLogos";
import { getSettings } from "@/lib/api/server";
import NewsletterForm from "./NewsletterForm";

const HEADING = "mb-4 font-[family-name:var(--font-jost)] text-[1.02rem] xl:text-[1.15rem] 2xl:text-[1.25rem] font-bold uppercase tracking-[0.08em] text-gold-400";
const LINK = "text-[0.92rem] xl:text-[1rem] 2xl:text-[1.05rem] text-cream-100/85 transition-colors hover:text-gold-300 font-sans";

const COLUMNS = [
  {
    title: "SHOP",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "Best Sellers", href: "/shop?filter=bestsellers" },
      { label: "New Arrivals", href: "/shop?filter=coming-soon" },
      { label: "Offers", href: "/shop?category=offers" },
      { label: "Gift Cards", href: "/gift-cards" },
    ],
  },
  {
    title: "CUSTOMER CARE",
    links: [
      { label: "FAQs", href: "/faqs" },
      { label: "Shipping & Delivery", href: "/shipping" },
      { label: "Returns & Refunds", href: "/returns" },
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

export default async function Footer() {
  const { store } = await getSettings();
  const socials = socialProfiles(store.social, ["instagram", "youtube", "facebook", "x", "pinterest"]);

  const [shopCol, careCol, aboutCol] = COLUMNS;

  return (
    <footer id="site-footer" className="bg-[#20082d] text-cream-100 border-t border-[#D4AF37]/25">
      <div className="container-vel flex flex-col gap-8 py-10 lg:grid lg:grid-cols-[1.3fr_0.85fr_1.05fr_0.8fr_1.9fr] lg:gap-0 lg:py-12 xl:py-14 2xl:py-16">
        {/* Brand & Socials */}
        <div className="flex flex-col items-start pr-2 lg:pr-6 xl:pr-10">
          <Link href="/" className="inline-block transition-opacity hover:opacity-90">
            <Image
              src="/brand/footer-logo-light.png"
              alt={store.name}
              width={260}
              height={85}
              className="h-12 xl:h-14 2xl:h-15 w-auto object-contain"
              priority={false}
            />
          </Link>
          <p className="mt-4 max-w-[18rem] xl:max-w-[22rem] text-[0.9rem] xl:text-[1rem] 2xl:text-[1.05rem] leading-[1.65] text-cream-100/80">
            Clean beauty backed by science and made to make you feel beautiful, every day.
          </p>
          <div className="mt-6 flex items-center gap-2 sm:gap-3 xl:gap-3.5">
            {socials.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={`Velastia on ${label}`}
                target="_blank"
                rel="noopener noreferrer"
                className="grid size-11 xl:size-12 place-items-center rounded-full border border-cream-100/35 text-cream-100/90 transition-all hover:border-gold-400 hover:text-gold-400 hover:scale-105 active:scale-95"
              >
                <Icon className="size-4 xl:size-4.5" />
              </a>
            ))}
          </div>
        </div>

        {/* SHOP & CUSTOMER CARE: side by side on mobile with a very thin gold vertical divider */}
        <div className="grid grid-cols-2 border-y border-[#D4AF37]/20 py-7 lg:contents lg:border-y-0 lg:py-0">
          {/* SHOP */}
          <div className="flex flex-col items-start pr-4 sm:pr-6 lg:border-l lg:border-[#D4AF37]/30 lg:pl-6 xl:pl-9 2xl:pl-12 lg:pr-3">
            <h3 className={HEADING}>{shopCol.title}</h3>
            <ul className="space-y-2.5 xl:space-y-3">
              {shopCol.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className={LINK}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CUSTOMER CARE (right side of SHOP with very thin gold line) */}
          <div className="flex flex-col items-start pl-4 sm:pl-6 border-l border-[#D4AF37]/30 lg:border-l lg:border-[#D4AF37]/30 lg:pl-6 xl:pl-9 2xl:pl-12 lg:pr-3">
            <h3 className={HEADING}>{careCol.title}</h3>
            <ul className="space-y-2.5 xl:space-y-3">
              {careCol.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className={LINK}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ABOUT */}
        <div className="flex flex-col items-start pb-2 lg:pb-0 lg:border-l lg:border-[#D4AF37]/30 lg:pl-6 xl:pl-9 2xl:pl-12 lg:pr-3">
          <h3 className={HEADING}>{aboutCol.title}</h3>
          <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-x-6 gap-y-2.5 xl:gap-y-3 w-full lg:w-auto">
            {aboutCol.links.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className={LINK}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter & Payment Badges */}
        <div className="flex flex-col items-start border-t border-[#D4AF37]/20 pt-7 lg:border-t-0 lg:pt-0 lg:border-l lg:border-[#D4AF37]/30 lg:pl-6 xl:pl-9 2xl:pl-12">
          <h2 className="font-display text-[1.45rem] xl:text-[1.75rem] 2xl:text-[1.95rem] font-medium uppercase tracking-[0.03em] text-gold-400 leading-tight">
            SUBSCRIBE & GET 10% OFF
          </h2>
          <p className="mt-2.5 max-w-[22rem] xl:max-w-[26rem] text-[0.92rem] xl:text-[1.02rem] 2xl:text-[1.08rem] leading-relaxed text-cream-100/85">
            Join our community and get exclusive offers, beauty tips & new product updates.
          </p>
          <div className="mt-5 w-full">
            <NewsletterForm variant="button" />
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3 sm:gap-3.5 xl:gap-4">
            <Visa className="h-5 xl:h-6 w-auto shrink-0" />
            <Mastercard className="h-7 xl:h-8 w-auto shrink-0" />
            <Amex className="h-6 xl:h-7 w-auto shrink-0" />
            <Paytm className="h-6 xl:h-7 w-auto shrink-0" />
            <Upi className="h-5 xl:h-6 w-auto shrink-0 text-white" />
          </div>
        </div>
      </div>

      <FooterBar storeName={store.name} />
    </footer>
  );
}

/** The copyright row along the bottom, uniform across all pages. */
export function FooterBar({ storeName }: { storeName: string }) {
  return (
    <div className="border-t border-[#D4AF37]/25">
      <div className="container-vel flex flex-col items-center justify-between gap-4 py-5 text-[0.85rem] text-cream-100/75 sm:flex-row text-center sm:text-left">
        <p>© 2026 {storeName}. All Rights Reserved.</p>
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
          <span className="hidden h-3.5 w-px bg-[#D4AF37]/35 sm:inline-block" />
          <Link href="/privacy" className="min-h-[44px] inline-flex items-center transition-colors hover:text-gold-300">
            Privacy Policy
          </Link>
          <span className="h-3.5 w-px bg-[#D4AF37]/35" />
          <Link href="/terms" className="min-h-[44px] inline-flex items-center transition-colors hover:text-gold-300">
            Terms & Conditions
          </Link>
        </div>
      </div>
    </div>
  );
}
