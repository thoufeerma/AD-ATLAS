import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import TaxForm from "@/components/settings/TaxForm";
import { apiGet, requireAdmin } from "@/lib/api/server";
import { can, type ProductListItem, type SiteSettings } from "@/lib/api/types";

export const metadata: Metadata = { title: "Tax Settings" };

export default async function TaxPage() {
  const admin = await requireAdmin();
  if (!can.editStore(admin.role)) {
    return (
      <>
        <PageHeader title="Tax Settings" />
        <p className="rounded-[var(--radius-card)] border border-hairline bg-card p-8 text-center text-[0.82rem] text-ink-2">
          GST details are managed by Super Administrators.
        </p>
      </>
    );
  }

  const [settings, products] = await Promise.all([
    apiGet<SiteSettings>("/admin/settings"),
    apiGet<ProductListItem[]>("/admin/products"),
  ]);

  // Products grouped by how they're taxed, so a wrong code stands out.
  const groups = new Map<string, { hsnCode: string; rateBps: number; products: ProductListItem[] }>();
  for (const p of products) {
    const key = `${p.hsnCode}|${p.gstRateBps}`;
    const g = groups.get(key) ?? { hsnCode: p.hsnCode, rateBps: p.gstRateBps, products: [] };
    g.products.push(p);
    groups.set(key, g);
  }
  const byCode = [...groups.values()].sort((a, b) => a.hsnCode.localeCompare(b.hsnCode) || a.rateBps - b.rateBps);

  return (
    <>
      <PageHeader
        title="Tax Settings"
        subtitle="Your GST registration, for the tax invoice each order gets"
        actions={
          <Badge tone={settings.tax.gstin ? "good" : "neutral"}>
            {settings.tax.gstin ? "Invoicing on" : "Invoicing off"}
          </Badge>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card title="GST Registration">
          <TaxForm initial={settings.tax} legalEntity={settings.store?.legalEntity ?? ""} />
        </Card>

        <Card title="How Invoices Work">
          <ul className="list-disc space-y-2.5 pl-4 text-[0.76rem] leading-relaxed text-ink-2">
            <li>
              An order gets its invoice when you mark it <strong className="font-medium text-ink">Shipped</strong>. To
              print one for the parcel before then, use <em>Create invoice</em> on the order.
            </li>
            <li>Numbers run in sequence through each financial year (April to March) and never repeat.</li>
            <li>
              Customers download theirs from Track Order and from their account&apos;s order history. You open it
              from the order page.
            </li>
            <li>
              Prices already include GST; the invoice shows the tax inside them. A coupon&apos;s discount is shared
              across the items, and delivery is taxed at the items&apos; rate.
            </li>
            <li>
              Each month&apos;s totals, by state and by HSN code, are under{" "}
              <Link href="/reports/gst" className="font-medium text-series-1 hover:underline">
                GST Summary
              </Link>{" "}
              for filing your returns.
            </li>
          </ul>
          <p className="mt-4 rounded-lg bg-plane px-3.5 py-2.5 text-[0.7rem] leading-relaxed text-ink-2">
            Have your accountant check the rates and HSN codes below, and the first few invoices, before you rely
            on them.
          </p>
        </Card>
      </div>

      <Card title="GST on Your Products" className="mt-5" bodyClassName="p-0">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-hairline">
              {["HSN code", "GST rate", "Products"].map((h) => (
                <th key={h} scope="col" className="px-5 py-2.5 text-[0.66rem] font-semibold uppercase tracking-wider text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {byCode.map((g) => (
              <tr key={`${g.hsnCode}-${g.rateBps}`} className="border-b border-hairline align-top last:border-0">
                <td className="tnum px-5 py-3 text-[0.8rem] font-medium text-ink">{g.hsnCode}</td>
                <td className="tnum px-5 py-3 text-[0.8rem] text-ink">{g.rateBps / 100}%</td>
                <td className="px-5 py-3 text-[0.76rem] leading-relaxed text-ink-2">
                  {g.products.map((p, i) => (
                    <span key={p.id}>
                      {i > 0 && ", "}
                      <Link href={`/products/${p.id}`} className="hover:text-series-1 hover:underline">
                        {p.name.replace(/^Velastia /, "")}
                      </Link>
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="border-t border-hairline px-5 py-3 text-[0.7rem] text-muted">
          Change a product&apos;s HSN code or rate on its page. Orders keep the rate they were placed at.
        </p>
      </Card>
    </>
  );
}
