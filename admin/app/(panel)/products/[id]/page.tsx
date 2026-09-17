import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductForm from "@/components/products/ProductForm";
import { ApiError, apiGet } from "@/lib/api/server";
import type { Category, ProductDetail } from "@/lib/api/types";

export const metadata: Metadata = { title: "Edit Product" };

export default async function EditProductPage({ params }: PageProps<"/products/[id]">) {
  const { id } = await params;

  let product: ProductDetail;
  let categories: Category[];
  try {
    [product, categories] = await Promise.all([
      apiGet<ProductDetail>(`/admin/products/${encodeURIComponent(id)}`),
      apiGet<Category[]>("/admin/categories"),
    ]);
  } catch (err) {
    // Only a real 404 is "not found"; a session redirect must propagate.
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  // No remount on refresh: after a save the form's own state already matches
  // what was stored, and a remount would wipe the "Changes saved" message.
  return <ProductForm mode="edit" product={product} categories={categories} />;
}
