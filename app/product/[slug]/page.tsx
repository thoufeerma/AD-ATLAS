import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageBanner from "@/components/ui/PageBanner";
import ProductDetail from "@/components/product/ProductDetail";
import TrustStrip from "@/components/ui/TrustStrip";
import { getProduct, getProducts } from "@/lib/api/server";

// Pre-render every product at build; ones added later in the admin render on
// their first visit and are cached from then on.
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.metaTitle ?? product.name,
    description: product.metaDescription ?? product.blurb ?? product.descriptor ?? undefined,
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const [product, catalog] = await Promise.all([getProduct(slug), getProducts()]);
  if (!product) notFound();

  return (
    <>
      <PageBanner
        tone="light"
        crumbs={[
          { label: "Home", href: "/" },
          { label: product.category.name, href: `/shop?category=${product.category.slug}` },
          { label: product.name },
        ]}
      />
      <ProductDetail product={product} catalog={catalog} />
      <TrustStrip />
    </>
  );
}
