import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PageBanner from "@/components/ui/PageBanner";
import PostBody from "@/components/blog/PostBody";
import Button from "@/components/ui/Button";
import { getBlogPost, getBlogPosts } from "@/lib/api/server";
import { absoluteUrl } from "@/lib/site";

const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Post not found", robots: { index: false } };

  const description = post.excerpt ?? undefined;
  return {
    title: post.title,
    description,
    openGraph: {
      type: "article",
      title: post.title,
      description,
      publishedTime: post.publishedAt,
      authors: [post.author],
      ...(post.coverUrl ? { images: [{ url: absoluteUrl(post.coverUrl) }] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  const more = (await getBlogPosts(4)).filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <PageBanner
        tone="light"
        crumbs={[{ label: "Home", href: "/" }, { label: "Journal", href: "/blog" }, { label: post.title }]}
      />

      <article className="container-vel py-10">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-3xl leading-tight text-plum-800 sm:text-4xl">{post.title}</h1>
          <p className="mt-3 text-[0.75rem] text-ink-soft">
            {post.author} · {day(post.publishedAt)} · {post.readingMinutes} min read
          </p>
        </header>

        {post.coverUrl && (
          <div className="relative mx-auto mt-8 aspect-16/9 max-w-4xl overflow-hidden rounded-[var(--radius-card)] bg-cream-200/60">
            <Image src={post.coverUrl} alt="" fill sizes="(min-width: 1024px) 896px, 100vw" className="object-cover" priority />
          </div>
        )}

        <div className="mx-auto mt-10 max-w-2xl">
          {post.excerpt && (
            <p className="mb-6 border-l-2 border-gold-400 pl-4 font-display text-lg leading-relaxed text-plum-800">
              {post.excerpt}
            </p>
          )}
          <PostBody body={post.body} />

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-gold-200/70 pt-6">
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-[0.78rem] text-plum-600 hover:text-gold-600">
              <ArrowLeft className="size-3.5" /> All posts
            </Link>
            <Button href="/shop" size="sm">
              Shop the collection
            </Button>
          </div>
        </div>
      </article>

      {more.length > 0 && (
        <section className="bg-cream-100 py-12">
          <div className="container-vel">
            <h2 className="font-display text-2xl text-plum-800">More from the Journal</h2>
            <ul className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((p) => (
                <li key={p.slug}>
                  <Link href={`/blog/${p.slug}`} className="group block">
                    <div className="relative aspect-4/3 overflow-hidden rounded-[var(--radius-card)] bg-cream-200/60">
                      {p.coverUrl && (
                        <Image
                          src={p.coverUrl}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      )}
                    </div>
                    <h3 className="mt-3.5 font-display text-lg leading-snug text-plum-800 group-hover:text-gold-700">
                      {p.title}
                    </h3>
                    <p className="mt-1.5 text-[0.7rem] text-ink-soft">
                      {day(p.publishedAt)} · {p.readingMinutes} min read
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
