import type { Metadata } from "next";
import ProductForm from "@/components/products/ProductForm";
import { apiGet } from "@/lib/api/server";
import type { Category } from "@/lib/api/types";

export const metadata: Metadata = { title: "Add Product" };

export default async function NewProductPage() {
  const categories = await apiGet<Category[]>("/admin/categories");
  return <ProductForm mode="create" categories={categories} />;
}
