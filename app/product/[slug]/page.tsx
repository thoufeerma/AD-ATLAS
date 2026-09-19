import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageBanner from "@/components/ui/PageBanner";
import ProductDetail from "@/components/product/ProductDetail";
import TrustStrip from "@/components/ui/TrustStrip";
import { getProduct, getProducts, getSettings } from "@/lib/api/server";
import type { ProductDetail as Detail } from "@/lib/api/types";
import { absoluteUrl, SITE_URL } from "@/lib/site";
import { productImage } from "@/lib/utils";

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
  const title = product.metaTitle ?? product.name;
  const description = product.metaDescription ?? product.blurb ?? product.descriptor ?? undefined;
  return {
    title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: "website",
      siteName: "Velastia",
      locale: "en_IN",
      url: `/product/${product.slug}`,
      title,
      description,
      images: (product.images.length ? product.images : [{ url: productImage(product), alt: null }])
        .slice(0, 4)
        .map((i) => ({ url: i.url, alt: i.alt ?? product.name })),
    },
  };
}

/**
 * schema.org Product data, so search engines can show the price, stock and
 * star rating with the result. Coming-soon products carry no offer.
 */
function productJsonLd(product: Detail, brand: string) {
  const url = `${SITE_URL}/product/${product.slug}`;
  const images = product.images.length ? product.images.map((i) => i.url) : [productImage(product)];
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.metaDescription ?? product.blurb ?? product.descriptor ?? undefined,
    image: images.map(absoluteUrl),
    url,
    category: product.category.name,
    brand: { "@type": "Brand", name: brand },
    ...(product.status === "ACTIVE" && {
      offers: {
        "@type": "Offer",
        url,
        priceCurrency: "INR",
        price: (product.pricePaise / 100).toFixed(2),
        availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
      },
    }),
    ...(product.reviewSummary.total > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.reviewSummary.average,
        reviewCount: product.reviewSummary.total,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const [product, catalog, { store }] = await Promise.all([getProduct(slug), getProducts(), getSettings()]);
  if (!product) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        // Escape "<" so product text can never close the script tag early.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd(product, store.name)).replace(/</g, "\\u003c"),
        }}
      />
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
