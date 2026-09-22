import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import StatCard from "@/components/ui/StatCard";
import ExportCsv from "@/components/reports/ExportCsv";
import MonthPicker from "@/components/reports/MonthPicker";
import { apiGet } from "@/lib/api/server";
import type { GstReport } from "@/lib/api/types";
import { cn, inr, monthLong, num } from "@/lib/utils";

export const metadata: Metadata = { title: "GST Summary" };

const rupees = (paise: number) => inr(paise / 100);
/** Plain figures for the spreadsheet: no ₹, no grouping, always two decimals. */
const csv = (paise: number) => (paise / 100).toFixed(2);
const pct = (bps: number) => `${bps / 100}%`;
const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

export default async function GstReportPage({ searchParams }: PageProps<"/reports/gst">) {
  const sp = await searchParams;
  const month = typeof sp.month === "string" && /^\d{4}-\d{2}$/.test(sp.month) ? sp.month : undefined;
  const r = await apiGet<GstReport>(`/admin/reports/gst${month ? `?month=${month}` : ""}`);
  const label = monthLong(r.month);

  return (
    <>
      <PageHeader
        title="GST Summary"
        subtitle={`Invoices issued in ${label}, set out the way GST returns ask for them`}
        actions={
          <>
            <MonthPicker month={r.month} months={r.months} />
            <ExportCsv
              filename={`velastia-gst-${r.month}`}
              disabled={r.invoices.length === 0}
              sections={[
                {
                  title: `Invoices — ${label}`,
                  columns: ["Invoice", "Date", "Order", "Customer", "Place of supply", "State code", "Status", "Taxable value", "CGST", "SGST", "IGST", "Invoice total"],
                  rows: r.invoices.map((i) => [
                    i.number, day(i.issuedAt), i.orderNumber, i.customer, i.state, i.stateCode ?? "", i.status,
                    csv(i.taxablePaise), csv(i.cgstPaise), csv(i.sgstPaise), csv(i.igstPaise), csv(i.totalPaise),
                  ]),
                },
                {
                  title: "By place of supply and rate (cancelled invoices left out)",
                  columns: ["Place of supply", "State code", "Rate", "Taxable value", "CGST", "SGST", "IGST"],
                  rows: r.byState.map((s) => [
                    s.state, s.stateCode ?? "", pct(s.rateBps), csv(s.taxablePaise), csv(s.cgstPaise), csv(s.sgstPaise), csv(s.igstPaise),
                  ]),
                },
                {
                  title: "By HSN code (cancelled invoices left out)",
                  columns: ["HSN", "Rate", "Quantity", "Taxable value", "CGST", "SGST", "IGST", "Total value"],
                  rows: r.byHsn.map((h) => [
                    h.hsnCode, pct(h.rateBps), h.quantity, csv(h.taxablePaise), csv(h.cgstPaise), csv(h.sgstPaise), csv(h.igstPaise), csv(h.totalPaise),
                  ]),
                },
              ]}
            />
          </>
        }
      />

      {!r.seller && (
        <p className="mb-5 rounded-[var(--radius-card)] border border-hairline bg-card px-5 py-4 text-[0.78rem] text-ink-2">
          Invoicing is off. Save your GSTIN under{" "}
          <Link href="/settings/tax" className="font-medium text-series-1 hover:underline">
            Tax Settings
          </Link>{" "}
          and orders get invoices as they ship.
        </p>
      )}

      <div className="mb-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Invoices" value={num(r.totals.invoices)} slot={1} note={r.totals.cancelled ? `plus ${r.totals.cancelled} cancelled` : label} />
        <StatCard label="Taxable Value" value={rupees(r.totals.taxablePaise)} slot={2} note="before GST" />
        <StatCard label="CGST + SGST" value={rupees(r.totals.cgstPaise + r.totals.sgstPaise)} slot={3} note={r.seller?.state ? `delivered in ${r.seller.state.name}` : "same-state deliveries"} />
        <StatCard label="IGST" value={rupees(r.totals.igstPaise)} note="delivered to other states" />
      </div>

      {r.invoices.length === 0 ? (
        <Card title="Invoices">
          <p className="py-6 text-center text-[0.8rem] text-ink-2">No invoices were issued in {label}.</p>
        </Card>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-5 xl:grid-cols-2">
            <Card title="By Place of Supply" bodyClassName="p-0">
              <Table
                columns={["State", "Rate", "Taxable", "CGST", "SGST", "IGST"]}
                rows={r.byState.map((s) => [
                  `${s.state}${s.stateCode ? ` (${s.stateCode})` : ""}`,
                  pct(s.rateBps),
                  rupees(s.taxablePaise),
                  rupees(s.cgstPaise),
                  rupees(s.sgstPaise),
                  rupees(s.igstPaise),
                ])}
              />
            </Card>
            <Card title="By HSN Code" bodyClassName="p-0">
              <Table
                columns={["HSN", "Rate", "Qty", "Taxable", "GST", "Total"]}
                rows={r.byHsn.map((h) => [
                  h.hsnCode,
                  pct(h.rateBps),
                  num(h.quantity),
                  rupees(h.taxablePaise),
                  rupees(h.cgstPaise + h.sgstPaise + h.igstPaise),
                  rupees(h.totalPaise),
                ])}
              />
            </Card>
          </div>

          <Card title="Invoices" bodyClassName="p-0">
            <Table
              columns={["Invoice", "Date", "Order", "Customer", "Place of supply", "Taxable", "GST", "Total"]}
              rows={r.invoices.map((i) => [
                <span key="n" className="flex flex-wrap items-center gap-2">
                  <a
                    href={`/api/v1/admin/orders/${encodeURIComponent(i.orderNumber)}/invoice`}
                    target="_blank"
                    rel="noopener"
                    className="font-medium text-series-1 hover:underline"
                  >
                    {i.number}
                  </a>
                  {i.status === "CANCELLED" && (
                    <Badge tone="critical" dot={false}>
                      Cancelled
                    </Badge>
                  )}
                </span>,
                day(i.issuedAt),
                <Link key="o" href={`/orders/${i.orderNumber}`} className="hover:text-series-1 hover:underline">
                  {i.orderNumber}
                </Link>,
                i.customer,
                i.state,
                rupees(i.taxablePaise),
                rupees(i.cgstPaise + i.sgstPaise + i.igstPaise),
                rupees(i.totalPaise),
              ])}
              numericFrom={5}
            />
          </Card>

          <p className="text-[0.7rem] leading-relaxed text-muted">
            Cancelled invoices are listed but left out of the totals. Refunds and returns need credit notes, which
            aren&apos;t created here — give your accountant the Returns list for the month alongside this.
          </p>
        </div>
      )}
    </>
  );
}

function Table({
  columns,
  rows,
  numericFrom = 2,
}: {
  columns: string[];
  rows: React.ReactNode[][];
  /** Columns from this index on are right-aligned figures. */
  numericFrom?: number;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-hairline">
            {columns.map((c, i) => (
              <th
                key={c}
                scope="col"
                className={cn(
                  "whitespace-nowrap px-4 py-2.5 text-[0.66rem] font-semibold uppercase tracking-wider text-muted",
                  i >= numericFrom && "text-right",
                )}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, n) => (
            <tr key={n} className="border-b border-hairline last:border-0">
              {row.map((cell, i) => (
                <td
                  key={i}
                  className={cn(
                    "px-4 py-2.5 text-[0.78rem] text-ink",
                    i >= numericFrom && "tnum whitespace-nowrap text-right",
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
