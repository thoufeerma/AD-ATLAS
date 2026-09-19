import type { Metadata } from "next";
import PageBanner from "@/components/ui/PageBanner";
import AccountView from "@/components/account/AccountView";
import { getProducts } from "@/lib/api/server";

export const metadata: Metadata = { title: "My Account", robots: { index: false } };

export default async function AccountPage() {
  const products = await getProducts();
  return (
    <>
      <PageBanner title="My Account" tone="light" crumbs={[{ label: "Home", href: "/" }, { label: "My Account" }]} />
      <AccountView products={products} />
    </>
  );
}
