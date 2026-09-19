import type { Metadata } from "next";
import Link from "next/link";
import PageBanner from "@/components/ui/PageBanner";
import ProductCard from "@/components/ui/ProductCard";
import SearchBox from "@/components/search/SearchBox";
import { getCategories, searchProducts } from "@/lib/api/server";

/** The API accepts up to 100 characters; anything longer is cut rather than refused. */
function readQuery(q: string | string[] | undefined) {
  return (typeof q === "string" ? q : "").trim().slice(0, 100);
}

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const q = readQuery((await searchParams).q);
  return {
    title: q ? `Search results for “${q}”` : "Search",
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const q = readQuery((await searchParams).q);
  const [results, categories] = await Promise.all([
    q ? searchProducts(q) : Promise.resolve(null),
    getCategories(),
  ]);

  return (
    <>
      <PageBanner
        title="Search"
        tone="light"
        crumbs={[{ label: "Home", href: "/" }, { label: "Search" }]}
      />
      <div className="container-vel py-10">
        <SearchBox defaultValue={q} className="mx-auto max-w-xl" />

        {results && (
          <p className="mt-8 text-[0.78rem] text-ink-soft" aria-live="polite">
            {results.length === 0
              ? `No products match “${q}”.`
              : `${results.length} ${results.length === 1 ? "product" : "products"} for “${q}”`}
          </p>
        )}

        {results && results.length > 0 ? (
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {results.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-8 text-center">
            <p className="text-sm text-ink-soft">
              {results ? "Try a different word, or browse a category:" : "Or browse a category:"}
            </p>
            <ul className="mt-4 flex flex-wrap justify-center gap-2">
              {categories
                .filter((c) => c.productCount > 0)
                .map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/shop?category=${c.slug}`}
                      className="label-caps inline-block rounded-full border border-gold-300/70 px-4 py-2 text-[0.64rem] text-plum-800 hover:border-gold-500 hover:bg-cream-50"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              <li>
                <Link
                  href="/shop"
                  className="label-caps inline-block rounded-full border border-gold-300/70 px-4 py-2 text-[0.64rem] text-plum-800 hover:border-gold-500 hover:bg-cream-50"
                >
                  All Products
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
