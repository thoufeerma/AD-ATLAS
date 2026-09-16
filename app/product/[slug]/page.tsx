import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageBanner from "@/components/ui/PageBanner";
import ProductDetail from "@/components/product/ProductDetail";
import TrustStrip from "@/components/ui/TrustStrip";
import { PRODUCTS, CATEGORIES, getProduct } from "@/lib/products";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.blurb ?? product.descriptor,
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const category = CATEGORIES.find((c) => c.id === product.category);

  return (
    <>
      <PageBanner
        tone="light"
        crumbs={[
          { label: "Home", href: "/" },
          { label: category?.label ?? "Shop", href: `/shop?category=${product.category}` },
          { label: product.name },
        ]}
      />
      <ProductDetail product={product} />
      <TrustStrip />
    </>
  );
}
