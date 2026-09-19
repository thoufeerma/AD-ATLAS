import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import MediaLibrary from "@/components/media/MediaLibrary";
import { apiGet, requireAdmin } from "@/lib/api/server";
import { can, type MediaAsset } from "@/lib/api/types";

export const metadata: Metadata = { title: "Media Library" };

export default async function MediaPage() {
  const admin = await requireAdmin();
  if (!can.editContent(admin.role)) {
    return (
      <>
        <PageHeader title="Media Library" />
        <p className="rounded-[var(--radius-card)] border border-hairline bg-card p-8 text-center text-[0.82rem] text-ink-2">
          Your role doesn&apos;t include the Media Library.
        </p>
      </>
    );
  }

  const assets = await apiGet<MediaAsset[]>("/admin/media");
  const unused = assets.filter((a) => a.usedIn.length === 0).length;
  return (
    <>
      <PageHeader
        title="Media Library"
        subtitle={`${assets.length} ${assets.length === 1 ? "image" : "images"}${unused ? ` · ${unused} unused` : ""} · use them in products, banners, testimonials and collaborators`}
      />
      <MediaLibrary assets={assets} />
    </>
  );
}
