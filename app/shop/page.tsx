import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import PageBanner from "@/components/ui/PageBanner";
import ShopBrowser, { type ShopFilter } from "@/components/shop/ShopBrowser";
import TrustStrip from "@/components/ui/TrustStrip";
import { bannerHeadlines, getCategories, getProducts } from "@/lib/api/server";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("shop");
}

const FILTERS: ShopFilter[] = ["bestsellers", "coming-soon"];

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const params = await searchParams;
  const category = typeof params.category === "string" ? params.category : undefined;
  const filter = FILTERS.find((f) => f === params.filter);
  const [products, categories, [promo]] = await Promise.all([
    getProducts(),
    getCategories(),
    bannerHeadlines("shop.sidebar"),
  ]);

  return (
    <>
      <PageBanner
        title="SHOP COLLECTION"
        lead="Premium beauty essentials, crafted with science and luxury for the modern Indian woman."
        crumbs={[{ label: "Home", href: "/" }, { label: "Shop" }]}
        image="/brand/shop-banner.png"
      />
      {/* Keyed so following a footer link while already on /shop resets the filters. */}
      <ShopBrowser
        key={`${category ?? ""}:${filter ?? ""}`}
        products={products}
        categories={categories}
        promo={promo ?? null}
        initialCategory={category}
        initialFilter={filter}
      />
      <TrustStrip />
    </>
  );
}
