import type { Metadata } from "next";
import { Plus } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import ProductsTable from "@/components/products/ProductsTable";
import { apiGet } from "@/lib/api/server";
import type { ProductListItem } from "@/lib/api/types";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage() {
  const products = await apiGet<ProductListItem[]>("/admin/products");
  const categories = new Set(products.map((p) => p.category.id)).size;

  return (
    <>
      <PageHeader
        title="Products"
        subtitle={`${products.length} products across ${categories} categories · archived products are hidden`}
        actions={
          <Button href="/products/new" size="sm">
            <Plus className="size-3.5" /> Add New Product
          </Button>
        }
      />
      <ProductsTable products={products} />
    </>
  );
}
