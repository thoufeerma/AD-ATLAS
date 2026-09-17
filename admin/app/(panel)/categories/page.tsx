import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import CategoriesManager from "@/components/categories/CategoriesManager";
import { apiGet } from "@/lib/api/server";
import type { Category } from "@/lib/api/types";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await apiGet<Category[]>("/admin/categories");
  const hidden = categories.filter((c) => !c.isVisible).length;

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle={`${categories.length} categories${hidden ? ` · ${hidden} hidden from the storefront` : ""} · ordered as they appear on the shop page`}
      />
      <CategoriesManager categories={categories} />
    </>
  );
}
