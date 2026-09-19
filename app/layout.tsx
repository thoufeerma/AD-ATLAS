import type { Metadata } from "next";
import { Cormorant_Garamond, Jost, Dancing_Script } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SettingsProvider } from "@/components/providers/SettingsProvider";
import AccountLoader from "@/components/providers/AccountLoader";
import { bannerHeadlines, getSettings } from "@/lib/api/server";
import { SITE_URL } from "@/lib/site";

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
  weight: ["400", "600"],
});

const DESCRIPTION =
  "Premium beauty, crafted with science and designed for the modern Indian woman. Clean, cruelty-free and dermatologically tested.";

export const metadata: Metadata = {
  // Relative image and page URLs in metadata resolve against the live domain.
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Velastia — Luxury. Science. You.",
    template: "%s | Velastia",
  },
  description: DESCRIPTION,
  // The card shown when a link is shared on WhatsApp, Instagram, X and so on.
  // Product pages replace it with the product's own photos.
  openGraph: {
    type: "website",
    siteName: "Velastia",
    locale: "en_IN",
    title: "Velastia — Luxury. Science. You.",
    description: DESCRIPTION,
    images: [{ url: "/brand/og-image.png", width: 1200, height: 630, alt: "Velastia" }],
  },
  twitter: { card: "summary_large_image" },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [settings, announcements] = await Promise.all([
    getSettings(),
    bannerHeadlines("global.topbar"),
  ]);

  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jost.variable} ${script.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream-50 text-ink">
        <SettingsProvider settings={settings}>
          <AccountLoader />
          <Header announcements={announcements} />
          <main className="flex-1">{children}</main>
          <Footer />
        </SettingsProvider>
      </body>
    </html>
  );
}
