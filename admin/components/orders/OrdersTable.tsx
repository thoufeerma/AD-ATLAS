"use client";

import { useRouter } from "next/navigation";
import Badge, { toneFor } from "@/components/ui/Badge";
import DataTable, { type Column } from "@/components/ui/DataTable";
import { humanize, type OrderListItem, type OrderStatus } from "@/lib/api/types";
import { inr } from "@/lib/utils";

const columns: Column<OrderListItem>[] = [
  {
    key: "number",
    header: "Order",
    cell: (o) => <span className="font-medium text-series-1">#{o.number}</span>,
  },
  {
    key: "customer",
    header: "Customer",
    value: (o) => `${o.customer} ${o.email}`,
    cell: (o) => (
      <span>
        <span className="block text-ink">{o.customer}</span>
        <span className="block text-[0.68rem] text-muted">{o.email}</span>
      </span>
    ),
  },
  { key: "city", header: "City" },
  { key: "itemCount", header: "Items", align: "right" },
  {
    key: "totalPaise",
    header: "Total",
    align: "right",
    cell: (o) => <span className="font-medium">{inr(o.totalPaise / 100)}</span>,
  },
  {
    key: "paymentMethod",
    header: "Payment",
    value: (o) => `${o.paymentMethod ?? ""} ${o.paymentStatus}`,
    cell: (o) => (
      <span>
        <span className="block text-ink">{o.paymentMethod ? humanize(o.paymentMethod) : "—"}</span>
        <span className="block text-[0.68rem] text-muted">{humanize(o.paymentStatus)}</span>
      </span>
    ),
  },
  {
    key: "placedAt",
    header: "Placed",
    value: (o) => o.placedAt,
    cell: (o) =>
      new Date(o.placedAt).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      }),
  },
  {
    key: "status",
    header: "Status",
    cell: (o) => <Badge tone={toneFor(o.status)}>{humanize(o.status)}</Badge>,
  },
];

const byStatus = (s: OrderStatus) => (o: OrderListItem) => o.status === s;

const filters = [
  { label: "Pending", test: byStatus("PENDING") },
  { label: "Confirmed", test: byStatus("CONFIRMED") },
  { label: "Processing", test: byStatus("PROCESSING") },
  {
    label: "Shipped",
    test: (o: OrderListItem) => o.status === "SHIPPED" || o.status === "OUT_FOR_DELIVERY",
  },
  { label: "Delivered", test: byStatus("DELIVERED") },
  { label: "Cancelled", test: byStatus("CANCELLED") },
  { label: "Refunded", test: byStatus("REFUNDED") },
];

export default function OrdersTable({ orders }: { orders: OrderListItem[] }) {
  const router = useRouter();
  return (
    <DataTable
      rows={orders}
      columns={columns}
      rowKey={(o) => o.id}
      filters={filters}
      searchPlaceholder="Search by order, name, email or city…"
      emptyMessage="No orders match. New storefront orders appear here as they are placed."
      onRowClick={(o) => router.push(`/orders/${o.number}`)}
    />
  );
}
