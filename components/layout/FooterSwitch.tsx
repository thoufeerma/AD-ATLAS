"use client";

import { usePathname } from "next/navigation";

/**
 * The shop page has a footer of its own (ShopFooter), the About and
 * Ingredients pages have none (their closing bands end the page), and every
 * other page uses the standard one. Both footers are rendered on the server
 * and handed in here, because the root layout that holds the footer doesn't
 * know the page.
 */
export default function FooterSwitch({
  standard,
  shop,
}: {
  standard: React.ReactNode;
  shop: React.ReactNode;
}) {
  const pathname = usePathname();
  if (pathname === "/about" || pathname === "/ingredients") return null;
  return pathname === "/shop" ? shop : standard;
}
