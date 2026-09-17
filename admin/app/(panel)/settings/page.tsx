"use client";

import { Save } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Toggle from "@/components/ui/Toggle";

export default function SettingsPage() {
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <PageHeader
        title="Settings"
        subtitle="Store identity, contact details and regional defaults"
        actions={
          <Button size="sm" type="submit">
            <Save className="size-3.5" /> Save Changes
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Store Details">
          <div className="space-y-4">
            <Field label="Store Name" defaultValue="Velastia" />
            <Field label="Legal Entity" defaultValue="AD Atlas Ventures Private Limited" />
            <Field label="Tagline" defaultValue="Luxury. Science. You." />
            <Field label="Support Email" defaultValue="hello@velastia.com" />
            <Field label="Support Phone" defaultValue="+91 98765 43210" />
            <Field label="Support Hours" defaultValue="Mon – Sat | 10AM – 7PM" />
          </div>
        </Card>

        <Card title="Address">
          <div className="space-y-4">
            <Field label="Address Line 1" defaultValue="Unit 402, Lotus Corporate Park" />
            <Field label="Address Line 2" defaultValue="Off Western Express Highway" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="City" defaultValue="Mumbai" />
              <Field label="State" defaultValue="Maharashtra" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Pincode" defaultValue="400063" />
              <Field label="Country" defaultValue="India" />
            </div>
            <Field label="GSTIN" defaultValue="27AABCA1234A1Z5" />
          </div>
        </Card>

        <Card title="Regional">
          <div className="space-y-4">
            <div>
              <Label>Currency</Label>
              <select className="w-full rounded-lg border border-hairline bg-card px-3.5 py-2.5 text-[0.8rem] text-ink focus:border-series-1 focus:outline-none">
                <option>INR — Indian Rupee (₹)</option>
                <option>USD — US Dollar ($)</option>
              </select>
            </div>
            <div>
              <Label>Timezone</Label>
              <select className="w-full rounded-lg border border-hairline bg-card px-3.5 py-2.5 text-[0.8rem] text-ink focus:border-series-1 focus:outline-none">
                <option>Asia/Kolkata (IST, UTC+5:30)</option>
              </select>
            </div>
            <div>
              <Label>Number Format</Label>
              <select className="w-full rounded-lg border border-hairline bg-card px-3.5 py-2.5 text-[0.8rem] text-ink focus:border-series-1 focus:outline-none">
                <option>Indian grouping — 12,45,678</option>
                <option>International grouping — 1,245,678</option>
              </select>
            </div>
            <Field label="Weight Unit" defaultValue="grams" />
          </div>
        </Card>

        <Card title="Storefront Behaviour">
          <ul className="space-y-4">
            {[
              { label: "Store is open for orders", on: true },
              { label: "Show out-of-stock products", on: true },
              { label: "Allow guest checkout", on: true },
              { label: "Enable wishlist", on: true },
              { label: "Enable product reviews", on: true },
              { label: "Auto-approve reviews of 4★ and above", on: false },
              { label: "Maintenance mode", on: false },
            ].map((r) => (
              <li key={r.label} className="flex items-center justify-between gap-4">
                <span className="text-[0.78rem] text-ink-2">{r.label}</span>
                <Toggle defaultOn={r.on} label={r.label} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </form>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">{children}</label>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-hairline bg-card px-3.5 py-2.5 text-[0.8rem] text-ink focus:border-series-1 focus:outline-none"
      />
    </div>
  );
}
