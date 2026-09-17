import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import OrdersTable from "@/components/orders/OrdersTable";
import { apiGet } from "@/lib/api/server";
import type { OrderListItem } from "@/lib/api/types";

export const metadata: Metadata = { title: "Orders" };

export default async function OrdersPage() {
  // The newest 200 orders; search and status filters run in the browser over
  // this set. Server-side pagination is the next step once volume needs it.
  const orders = await apiGet<OrderListItem[]>("/admin/orders?take=200");

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle={
          orders.length === 0
            ? "No orders yet"
            : `${orders.length} most recent order${orders.length === 1 ? "" : "s"}`
        }
      />
      <OrdersTable orders={orders} />
    </>
  );
}
