import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import CustomersTable from "@/components/customers/CustomersTable";
import { apiGet } from "@/lib/api/server";
import type { CustomerListItem } from "@/lib/api/types";
import { inr } from "@/lib/utils";

export const metadata: Metadata = { title: "Customers" };

export default async function CustomersPage() {
  const customers = await apiGet<CustomerListItem[]>("/admin/customers?take=200");
  const ltv = customers.reduce((n, c) => n + c.lifetimeValuePaise, 0);

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle={
          customers.length === 0
            ? "Customers appear here after their first order"
            : `${customers.length} customer${customers.length === 1 ? "" : "s"} · ${inr(ltv / 100)} lifetime value`
        }
      />
      <CustomersTable customers={customers} />
    </>
  );
}
