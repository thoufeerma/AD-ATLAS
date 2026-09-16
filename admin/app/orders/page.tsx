"use client";

import { useRouter } from "next/navigation";
import { Download, Filter } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge, { toneFor } from "@/components/ui/Badge";
import DataTable, { type Column } from "@/components/ui/DataTable";
import { ORDERS, type Order } from "@/lib/mock";
import { inr } from "@/lib/utils";

const columns: Column<Order>[] = [
  {
    key: "id",
    header: "Order",
    cell: (o) => <span className="font-medium text-series-1">#{o.id}</span>,
  },
  {
    key: "customer",
    header: "Customer",
    cell: (o) => (
      <span>
        <span className="block text-ink">{o.customer}</span>
        <span className="block text-[0.68rem] text-muted">{o.email}</span>
      </span>
    ),
  },
  { key: "city", header: "City" },
  { key: "items", header: "Items", align: "right" },
  {
    key: "total",
    header: "Total",
    align: "right",
    cell: (o) => <span className="font-medium">{inr(o.total)}</span>,
  },
  { key: "payment", header: "Payment" },
  { key: "placed", header: "Placed" },
  {
    key: "status",
    header: "Status",
    cell: (o) => <Badge tone={toneFor(o.status)}>{o.status}</Badge>,
  },
];

const filters = [
  { label: "Pending", test: (o: Order) => o.status === "Pending" },
  { label: "Processing", test: (o: Order) => o.status === "Processing" },
  { label: "Shipped", test: (o: Order) => o.status === "Shipped" },
  { label: "Delivered", test: (o: Order) => o.status === "Delivered" },
  { label: "Cancelled", test: (o: Order) => o.status === "Cancelled" },
  { label: "Refunded", test: (o: Order) => o.status === "Refunded" },
];

export default function OrdersPage() {
  const router = useRouter();

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle={`${ORDERS.length} orders in the current view`}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Filter className="size-3.5" /> Advanced Filter
            </Button>
            <Button size="sm">
              <Download className="size-3.5" /> Export CSV
            </Button>
          </>
        }
      />
      <DataTable
        rows={ORDERS}
        columns={columns}
        rowKey={(o) => o.id}
        filters={filters}
        searchPlaceholder="Search by order, name or city…"
        onRowClick={(o) => router.push(`/orders/${o.id}`)}
      />
    </>
  );
}
