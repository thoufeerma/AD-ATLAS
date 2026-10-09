import type { Metadata } from "next";
import { Cormorant_Garamond, Jost, Dancing_Script, Montserrat } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ShopFooter from "@/components/layout/ShopFooter";
import FooterSwitch from "@/components/layout/FooterSwitch";
import { SettingsProvider } from "@/components/providers/SettingsProvider";
import AccountLoader from "@/components/providers/AccountLoader";
import { bannerHeadlines, getSettings } from "@/lib/api/server";
import { siteMetadata } from "@/lib/seo";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const script = Dancing_Script({
  variable: "--font-script",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/**
 * Numbers in the display font (Cormorant Garamond) are drawn in Montserrat,
 * the price font, instead of Cormorant's old-style figures. This face holds
 * only the digits (plus % and +), so it's listed first in --font-display and
 * every other character falls through to Cormorant. The file is Montserrat's
 * Latin variable font (SIL Open Font License), all weights in one.
 * No adjusted fallback: a fallback face without the unicode-range would
 * catch the letters before Cormorant.
 */
const digits = localFont({
  src: "./fonts/montserrat-latin.woff2",
  variable: "--font-digits",
  weight: "100 900",
  display: "swap",
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+0030-0039, U+0025, U+002B" }],
});

/** Titles, descriptions and the share card, from SEO Settings in the admin. */
export async function generateMetadata(): Promise<Metadata> {
  return siteMetadata();
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [settings, announcements] = await Promise.all([
    getSettings(),
    bannerHeadlines("global.topbar"),
  ]);

  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jost.variable} ${script.variable} ${montserrat.variable} ${digits.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream-50 text-ink">
        <SettingsProvider settings={settings}>
          <AccountLoader />
          <Header announcements={announcements} />
          <main className="flex-1">{children}</main>
          <FooterSwitch standard={<Footer />} shop={<ShopFooter />} />
        </SettingsProvider>
      </body>
    </html>
  );
}
