"use client";

import { usePathname } from "next/navigation";

/**
 * The shop page has a footer of its own (ShopFooter); every other page uses
 * the standard one. Both are rendered on the server and handed in here,
 * because the root layout that holds the footer doesn't know the page.
 */
export default function FooterSwitch({
  standard,
  shop,
}: {
  standard: React.ReactNode;
  shop: React.ReactNode;
}) {
  return usePathname() === "/shop" ? shop : standard;
}
