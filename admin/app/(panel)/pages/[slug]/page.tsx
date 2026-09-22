import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import PageEditor from "@/components/pages/PageEditor";
import { ApiError, apiGet, requireAdmin } from "@/lib/api/server";
import { can, type PageDetail, type SiteSettings } from "@/lib/api/types";
import { inr } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/pages/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Edit /${slug}` };
}

export default async function EditPage({ params }: PageProps<"/pages/[slug]">) {
  const { slug } = await params;
  const admin = await requireAdmin();
  if (!can.editContent(admin.role)) notFound();

  let page: PageDetail;
  try {
    page = await apiGet<PageDetail>(`/admin/pages/${encodeURIComponent(slug)}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
  const { store, shipping, returns } = await apiGet<SiteSettings>("/admin/settings");

  // What each token becomes on the storefront right now.
  const tokenValues: Record<string, string> = {
    ...(shipping?.freeAbovePaise != null && { free_shipping_above: inr(shipping.freeAbovePaise / 100) }),
    ...(shipping && { shipping_fee: inr(shipping.pricePaise / 100) }),
    ...(store && {
      support_email: store.supportEmail,
      support_phone: store.supportPhone,
      support_hours: store.supportHours,
      store_name: store.name,
      legal_entity: store.legalEntity,
      city: store.city,
    }),
    return_window_days: String(returns.windowDays),
  };

  return (
    <>
      <Link
        href="/pages"
        className="mb-3 inline-flex items-center gap-1 text-[0.72rem] text-ink-2 hover:text-ink"
      >
        <ChevronLeft className="size-3.5" /> All pages
      </Link>
      <PageHeader title={page.title} subtitle={`storefront /${page.slug}`} />
      <PageEditor page={page} tokenValues={tokenValues} />
    </>
  );
}
