import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageBanner from "@/components/ui/PageBanner";
import { getBlogPosts } from "@/lib/api/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("blog");
}

const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

export default async function BlogIndexPage() {
  const posts = await getBlogPosts();
  // Nothing published yet: the Journal isn't a page that should exist.
  if (posts.length === 0) notFound();

  const [lead, ...rest] = posts;

  return (
    <>
      <PageBanner
        title="The Velastia Journal"
        tone="light"
        lead="Notes on ingredients, routines and the making of our products."
        crumbs={[{ label: "Home", href: "/" }, { label: "Journal" }]}
      />

      <div className="container-vel py-12">
        <Link
          href={`/blog/${lead.slug}`}
          className="group grid gap-6 overflow-hidden rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 md:grid-cols-2"
        >
          <div className="relative aspect-16/10 bg-cream-200/60 md:aspect-auto md:h-full">
            {lead.coverUrl && (
              <Image
                src={lead.coverUrl}
                alt=""
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                priority
              />
            )}
          </div>
          <div className="flex flex-col justify-center gap-3 p-6 sm:p-9">
            <p className="label-caps text-[0.6rem] text-gold-700">Latest</p>
            <h2 className="font-display text-2xl leading-tight text-plum-800 group-hover:text-gold-700 sm:text-3xl">
              {lead.title}
            </h2>
            {lead.excerpt && <p className="text-[0.9rem] leading-relaxed text-ink-soft">{lead.excerpt}</p>}
            <p className="text-[0.72rem] text-ink-soft">
              {lead.author} · {day(lead.publishedAt)} · {lead.readingMinutes} min read
            </p>
          </div>
        </Link>

        {rest.length > 0 && (
          <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="group block">
                  <div className="relative aspect-4/3 overflow-hidden rounded-[var(--radius-card)] bg-cream-200/60">
                    {post.coverUrl && (
                      <Image
                        src={post.coverUrl}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <h3 className="mt-4 font-display text-lg leading-snug text-plum-800 group-hover:text-gold-700">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="mt-1.5 line-clamp-3 text-[0.84rem] leading-relaxed text-ink-soft">{post.excerpt}</p>
                  )}
                  <p className="mt-2 text-[0.7rem] text-ink-soft">
                    {day(post.publishedAt)} · {post.readingMinutes} min read
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
