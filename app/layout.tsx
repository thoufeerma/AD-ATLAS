import type { Metadata } from "next";
import { Cormorant_Garamond, Jost, Dancing_Script } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
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
  weight: ["400", "600"],
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
