import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Pencil, Plus } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge, { toneFor } from "@/components/ui/Badge";
import { apiGet, requireAdmin } from "@/lib/api/server";
import { can, humanize, type BlogPostListItem } from "@/lib/api/types";

export const metadata: Metadata = { title: "Blog Posts" };

const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL ?? "http://localhost:3000";

const when = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

export default async function BlogPage() {
  const admin = await requireAdmin();
  if (!can.editContent(admin.role)) {
    return (
      <>
        <PageHeader title="Blog Posts" />
        <p className="rounded-[var(--radius-card)] border border-hairline bg-card p-8 text-center text-[0.82rem] text-ink-2">
          Your role doesn&apos;t include writing posts.
        </p>
      </>
    );
  }

  const posts = await apiGet<BlogPostListItem[]>("/admin/blog");
  const live = posts.filter((p) => p.status !== "DRAFT" && p.publishedAt && new Date(p.publishedAt) <= new Date());

  return (
    <>
      <PageHeader
        title="Blog Posts"
        subtitle={
          posts.length === 0
            ? "Articles for the storefront's Journal"
            : `${live.length} live of ${posts.length} — a scheduled post goes live on its own date`
        }
        actions={
          <Button href="/blog/new" size="sm">
            <Plus className="size-3.5" /> New Post
          </Button>
        }
      />

      {posts.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-hairline bg-card p-10 text-center">
          <p className="text-[0.86rem] font-medium text-ink">No posts yet</p>
          <p className="mx-auto mt-1.5 max-w-md text-[0.78rem] leading-relaxed text-ink-2">
            The Journal is hidden from the storefront until the first post is live. Write about a launch, an
            ingredient, or how to use a product — the sort of thing people search for.
          </p>
          <Button href="/blog/new" size="sm" className="mt-5">
            <Plus className="size-3.5" /> Write the first post
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-hairline bg-card">
          <table className="w-full text-left text-[0.78rem]">
            <thead className="border-b border-hairline text-[0.68rem] uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Author</th>
                <th className="px-5 py-3 font-medium">Publish Date</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {posts.map((p) => {
                const waiting = p.status === "SCHEDULED" && p.publishedAt && new Date(p.publishedAt) > new Date();
                return (
                  <tr key={p.id}>
                    <td className="px-5 py-3.5">
                      <Link href={`/blog/${p.id}`} className="font-medium text-ink hover:text-series-1">
                        {p.title}
                      </Link>
                      <span className="block text-[0.68rem] text-muted">/blog/{p.slug}</span>
                    </td>
                    <td className="px-5 py-3.5 text-ink-2">{p.author}</td>
                    <td className="px-5 py-3.5 text-ink-2">{when(p.publishedAt)}</td>
                    <td className="px-5 py-3.5">
                      <Badge tone={toneFor(p.status)}>{waiting ? "Scheduled" : humanize(p.status)}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="inline-flex items-center gap-3">
                        {p.status !== "DRAFT" && !waiting && (
                          <a
                            href={`${STORE_URL}/blog/${p.slug}`}
                            target="_blank"
                            rel="noopener"
                            className="inline-flex items-center gap-1 text-[0.72rem] text-ink-2 hover:text-series-1"
                          >
                            <ExternalLink className="size-3" /> View
                          </a>
                        )}
                        <Link
                          href={`/blog/${p.id}`}
                          className="inline-flex items-center gap-1 text-[0.72rem] font-medium text-series-1 hover:underline"
                        >
                          <Pencil className="size-3" /> Edit
                        </Link>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
