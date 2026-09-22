import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import StatCard from "@/components/ui/StatCard";
import ExportCsv from "@/components/reports/ExportCsv";
import MonthPicker from "@/components/reports/MonthPicker";
import { apiGet } from "@/lib/api/server";
import { CREDIT_REASON_LABEL, type GstReport } from "@/lib/api/types";
import { cn, inr, monthLong, num } from "@/lib/utils";

export const metadata: Metadata = { title: "GST Summary" };

const rupees = (paise: number) => (paise < 0 ? `−${inr(-paise / 100)}` : inr(paise / 100));
/** Plain figures for the spreadsheet: no ₹, no grouping, always two decimals. */
const csv = (paise: number) => (paise / 100).toFixed(2);
const pct = (bps: number) => `${bps / 100}%`;
const gst = (s: { cgstPaise: number; sgstPaise: number; igstPaise: number }) => s.cgstPaise + s.sgstPaise + s.igstPaise;
const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

export default async function GstReportPage({ searchParams }: PageProps<"/reports/gst">) {
  const sp = await searchParams;
  const month = typeof sp.month === "string" && /^\d{4}-\d{2}$/.test(sp.month) ? sp.month : undefined;
  const r = await apiGet<GstReport>(`/admin/reports/gst${month ? `?month=${month}` : ""}`);
  const label = monthLong(r.month);
  const { invoices: inv, creditNotes: cn, net } = r.totals;
  const empty = r.invoices.length === 0 && r.creditNotes.length === 0;

  return (
    <>
      <PageHeader
        title="GST Summary"
        subtitle={`Invoices and credit notes issued in ${label}, set out the way GST returns ask for them`}
        actions={
          <>
            <MonthPicker month={r.month} months={r.months} />
            <ExportCsv
              filename={`velastia-gst-${r.month}`}
              disabled={empty}
              sections={[
                {
                  title: `Invoices — ${label}`,
                  columns: ["Invoice", "Date", "Order", "Customer", "Place of supply", "State code", "Order status", "Taxable value", "CGST", "SGST", "IGST", "Invoice total"],
                  rows: r.invoices.map((i) => [
                    i.number, day(i.issuedAt), i.orderNumber, i.customer, i.state, i.stateCode ?? "", i.status,
                    csv(i.taxablePaise), csv(i.cgstPaise), csv(i.sgstPaise), csv(i.igstPaise), csv(i.totalPaise),
                  ]),
                },
                {
                  title: `Credit notes — ${label}`,
                  columns: ["Credit note", "Date", "Against invoice", "Order", "Reason", "Customer", "Place of supply", "State code", "Taxable value", "CGST", "SGST", "IGST", "Total"],
                  rows: r.creditNotes.map((n) => [
                    n.number, day(n.issuedAt), n.invoiceNumber, n.orderNumber,
                    n.returnNumber ? `${CREDIT_REASON_LABEL[n.reason]} ${n.returnNumber}` : CREDIT_REASON_LABEL[n.reason],
                    n.customer, n.state, n.stateCode ?? "",
                    csv(n.taxablePaise), csv(n.cgstPaise), csv(n.sgstPaise), csv(n.igstPaise), csv(n.totalPaise),
                  ]),
                },
                {
                  title: "By place of supply and rate (invoices less credit notes)",
                  columns: ["Place of supply", "State code", "Rate", "Taxable value", "CGST", "SGST", "IGST"],
                  rows: r.byState.map((s) => [
                    s.state, s.stateCode ?? "", pct(s.rateBps), csv(s.taxablePaise), csv(s.cgstPaise), csv(s.sgstPaise), csv(s.igstPaise),
                  ]),
                },
                {
                  title: "By HSN code (invoices less credit notes)",
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
        <StatCard label="Invoiced" value={rupees(inv.totalPaise)} slot={1} note={`${num(inv.count)} invoice${inv.count === 1 ? "" : "s"}`} />
        <StatCard label="Credit Notes" value={rupees(cn.totalPaise)} slot={2} note={`${num(cn.count)} for returns, refunds and cancellations`} />
        <StatCard label="Net Taxable Value" value={rupees(net.taxablePaise)} slot={3} note="before GST" />
        <StatCard
          label="Net GST"
          value={rupees(gst(net))}
          note={`CGST ${rupees(net.cgstPaise)} · SGST ${rupees(net.sgstPaise)} · IGST ${rupees(net.igstPaise)}`}
        />
      </div>

      {empty ? (
        <Card title="Invoices">
          <p className="py-6 text-center text-[0.8rem] text-ink-2">No invoices or credit notes were issued in {label}.</p>
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
                empty="Everything invoiced this month was credited back."
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
                  rupees(gst(h)),
                  rupees(h.totalPaise),
                ])}
                empty="Everything invoiced this month was credited back."
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
                  {(i.status === "CANCELLED" || i.status === "REFUNDED") && (
                    <Badge tone="neutral" dot={false}>
                      {i.status === "CANCELLED" ? "Cancelled" : "Refunded"}
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
                rupees(gst(i)),
                rupees(i.totalPaise),
              ])}
              numericFrom={5}
              empty={`No invoices were issued in ${label}.`}
            />
          </Card>

          <Card title="Credit Notes" bodyClassName="p-0">
            <Table
              columns={["Credit note", "Date", "Against", "Reason", "Place of supply", "Taxable", "GST", "Total"]}
              rows={r.creditNotes.map((n) => [
                <a
                  key="n"
                  href={`/api/v1/admin/orders/${encodeURIComponent(n.orderNumber)}/credit-notes/${n.id}`}
                  target="_blank"
                  rel="noopener"
                  className="font-medium text-series-1 hover:underline"
                >
                  {n.number}
                </a>,
                day(n.issuedAt),
                <Link key="o" href={`/orders/${n.orderNumber}`} className="hover:text-series-1 hover:underline">
                  {n.invoiceNumber}
                </Link>,
                n.returnNumber ? `${CREDIT_REASON_LABEL[n.reason]} ${n.returnNumber}` : CREDIT_REASON_LABEL[n.reason],
                n.state,
                rupees(n.taxablePaise),
                rupees(gst(n)),
                rupees(n.totalPaise),
              ])}
              numericFrom={5}
              empty={`No credit notes were issued in ${label}.`}
            />
          </Card>

          <p className="text-[0.7rem] leading-relaxed text-muted">
            Credit notes are issued automatically when a return is refunded, or an invoiced order is cancelled or
            refunded. The state and HSN totals are net of them. An invoice from an earlier month credited this month
            shows only here, under Credit Notes.
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
  empty,
}: {
  columns: string[];
  rows: React.ReactNode[][];
  /** Columns from this index on are right-aligned figures. */
  numericFrom?: number;
  empty: string;
}) {
  if (rows.length === 0) return <p className="px-5 py-6 text-center text-[0.78rem] text-ink-2">{empty}</p>;
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
