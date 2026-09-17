import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Velastia Admin",
    template: "%s · Velastia Admin",
  },
  description: "Store management and content system for Velastia.",
  robots: { index: false, follow: false },
};

/**
 * Root layout: document chrome only. The sidebar and topbar live in the
 * (panel) layout, so the login page renders without them.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="bg-plane text-ink">{children}</body>
    </html>
  );
}
