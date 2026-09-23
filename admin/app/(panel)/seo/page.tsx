import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import SeoForm from "@/components/settings/SeoForm";
import { apiGet, requireAdmin } from "@/lib/api/server";
import { can, type SiteSettings } from "@/lib/api/types";

export const metadata: Metadata = { title: "SEO Settings" };

export default async function SeoPage() {
  const admin = await requireAdmin();
  const editable = can.editContent(admin.role);

  if (!editable) {
    return (
      <>
        <PageHeader title="SEO Settings" />
        <p className="rounded-[var(--radius-card)] border border-hairline bg-card p-8 text-center text-[0.82rem] text-ink-2">
          Your role doesn&apos;t include the storefront&apos;s wording. Ask a Content Manager or Super
          Administrator.
        </p>
      </>
    );
  }

  const settings = await apiGet<SiteSettings>("/admin/settings");

  return (
    <>
      <PageHeader
        title="SEO Settings"
        subtitle="What Google and link previews show for each page, and whether the store is listed at all"
        actions={
          <Badge tone={settings.seo.indexable ? "good" : "neutral"}>
            {settings.seo.indexable ? "Listed in search" : "Hidden from search"}
          </Badge>
        }
      />
      <SeoForm initial={settings.seo} editable={editable} />
    </>
  );
}
