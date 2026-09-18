import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Pencil } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Badge, { toneFor } from "@/components/ui/Badge";
import { apiGet, requireAdmin } from "@/lib/api/server";
import { can, humanize, type PageListItem } from "@/lib/api/types";

export const metadata: Metadata = { title: "Pages" };

const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL ?? "http://localhost:3000";

export default async function PagesPage() {
  const admin = await requireAdmin();
  if (!can.editContent(admin.role)) {
    return (
      <>
        <PageHeader title="Pages" />
        <p className="rounded-[var(--radius-card)] border border-hairline bg-card p-8 text-center text-[0.82rem] text-ink-2">
          Your role doesn&apos;t include editing pages.
        </p>
      </>
    );
  }

  const pages = await apiGet<PageListItem[]>("/admin/pages");

  return (
    <>
      <PageHeader
        title="Pages"
        subtitle="Policy pages on the storefront — changes go live within a minute"
      />
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-hairline bg-card">
        <table className="w-full text-left text-[0.78rem]">
          <thead className="border-b border-hairline text-[0.68rem] uppercase tracking-wider text-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Page</th>
              <th className="px-5 py-3 font-medium">URL</th>
              <th className="px-5 py-3 font-medium">Last Updated</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {pages.map((p) => (
              <tr key={p.id}>
                <td className="px-5 py-3.5 font-medium text-ink">{p.title}</td>
                <td className="px-5 py-3.5 text-ink-2">/{p.slug}</td>
                <td className="px-5 py-3.5 text-ink-2">
                  {new Date(p.updatedAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-5 py-3.5">
                  <Badge tone={toneFor(p.status)}>{humanize(p.status)}</Badge>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <span className="inline-flex items-center gap-4">
                    <Link
                      href={`/pages/${p.slug}`}
                      className="inline-flex items-center gap-1 text-[0.72rem] font-medium text-series-1 hover:underline"
                    >
                      <Pencil className="size-3" /> Edit
                    </Link>
                    <a
                      href={`${STORE_URL}/${p.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[0.72rem] text-ink-2 hover:text-ink"
                    >
                      View <ExternalLink className="size-3" />
                    </a>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pages.length === 0 && (
          <p className="p-8 text-center text-[0.8rem] text-ink-2">No pages yet — run the seed.</p>
        )}
      </div>
    </>
  );
}
