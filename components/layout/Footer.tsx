import Link from "next/link";
import { socialProfiles } from "@/components/ui/SocialIcons";
import { getSettings } from "@/lib/api/server";
import NewsletterForm from "./NewsletterForm";

export default async function Footer() {
  const { store } = await getSettings();
  const socials = socialProfiles(store.social);

  return (
    <footer className="mt-20 bg-plum-900 text-cream-100">
      <div className="container-vel grid grid-cols-1 gap-12 py-14 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr] lg:gap-8">
        {/* Newsletter & Socials */}
        <div>
          <h2 className="font-display text-xl uppercase tracking-[0.05em] text-gold-300">
            SUBSCRIBE & GET 10% OFF
          </h2>
          <p className="mt-3 mb-5 text-[0.8rem] leading-relaxed text-cream-200/80">
            Join our community and get exclusive offers, beauty tips & new product updates.
          </p>
          <NewsletterForm />
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

        {/* Shop */}
        <div>
          <h3 className="font-display text-[0.85rem] tracking-wider uppercase text-cream-50 mb-5">SHOP</h3>
          <ul className="space-y-3">
            {[
              { label: "All Products", href: "/shop" },
              { label: "Lipstick", href: "/shop?category=lipstick" },
              { label: "Liquid Lipstick", href: "/shop?category=liquid-lipstick" },
              { label: "Face", href: "/shop?category=face" },
              { label: "Skincare", href: "/shop?category=skincare" },
              { label: "Accessories", href: "/shop?category=accessories" },
            ].map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-[0.75rem] text-cream-200/70 transition-colors hover:text-gold-300"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h3 className="font-display text-[0.85rem] tracking-wider uppercase text-cream-50 mb-5">CUSTOMER CARE</h3>
          <ul className="space-y-3">
            {[
              { label: "FAQs", href: "/faqs" },
              { label: "Shipping & Delivery", href: "/shipping" },
              { label: "Returns & Refunds", href: "/returns" },
              { label: "Terms & Conditions", href: "/terms" },
              { label: "Privacy Policy", href: "/privacy" },
            ].map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-[0.75rem] text-cream-200/70 transition-colors hover:text-gold-300"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* About */}
        <div>
          <h3 className="font-display text-[0.85rem] tracking-wider uppercase text-cream-50 mb-5">ABOUT</h3>
          <ul className="space-y-3">
            {[
              { label: "About Velastia", href: "/about" },
              { label: "Our Ingredients", href: "/ingredients" },
              { label: "Reviews", href: "/reviews" },
              { label: "Collaborations", href: "/collabs" },
              { label: "Contact Us", href: "/contact" },
            ].map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-[0.75rem] text-cream-200/70 transition-colors hover:text-gold-300"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* We Accept */}
        <div>
          <h3 className="label-caps mb-5 text-[0.7rem] text-cream-50">WE ACCEPT</h3>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold italic text-blue-500 text-xs bg-white/10 px-1.5 py-0.5 rounded">VISA</span>
            <span className="font-bold text-red-500 text-xs bg-white/10 px-1.5 py-0.5 rounded flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 -mr-1 opacity-90 relative z-10" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-90" />
            </span>
            <span className="font-bold italic text-green-500 text-xs bg-white/10 px-1.5 py-0.5 rounded">UPI</span>
            <span className="font-bold text-sky-400 text-xs bg-white/10 px-1.5 py-0.5 rounded">AMEX</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 bg-plum-950">
        <div className="container-vel flex flex-col items-center justify-between gap-3 py-5 text-[0.7rem] text-cream-200/55 sm:flex-row">
          <p>© {new Date().getFullYear()} {store.name}. All Rights Reserved.</p>
          <p>
            Made with <span className="text-gold-500 px-1">💛</span> in India
          </p>
        </div>
      </div>
    </footer>
  );
}
