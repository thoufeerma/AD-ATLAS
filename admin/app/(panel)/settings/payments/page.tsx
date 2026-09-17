"use client";

import { Save, KeyRound, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Toggle from "@/components/ui/Toggle";
import { PAYMENT_METHODS } from "@/lib/mock";

export default function PaymentsPage() {
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <PageHeader
        title="Payment Methods"
        subtitle="Razorpay is the gateway; each method below is one of its channels"
        actions={
          <Button size="sm" type="submit">
            <Save className="size-3.5" /> Save Changes
          </Button>
        }
      />

      <div className="mb-5 flex items-start gap-3 rounded-[var(--radius-card)] border border-warning/30 bg-warning/10 px-5 py-4">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#8a5d00]" />
        <p className="text-[0.8rem] text-[#8a5d00]">
          Razorpay is not connected yet. These toggles describe the intended
          configuration; nothing charges a card until the gateway is wired up in
          the backend phase.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card title="Channels" bodyClassName="p-0">
          <ul className="divide-y divide-hairline">
            {PAYMENT_METHODS.map((m) => (
              <li key={m.id} className="flex items-center gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[0.85rem] font-medium text-ink">{m.name}</p>
                  <p className="mt-0.5 text-[0.7rem] text-muted">{m.note}</p>
                </div>
                <Badge tone="neutral" dot={false}>
                  Fee {m.fee}
                </Badge>
                <Toggle defaultOn={m.enabled} label={`Enable ${m.name}`} />
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Gateway Credentials">
          <div className="space-y-4">
            <div>
              <Label>Mode</Label>
              <select className="w-full rounded-lg border border-hairline bg-card px-3.5 py-2.5 text-[0.8rem] text-ink focus:border-series-1 focus:outline-none">
                <option>Test</option>
                <option>Live</option>
              </select>
            </div>
            <Secret label="Key ID" placeholder="rzp_test_••••••••••••" />
            <Secret label="Key Secret" placeholder="••••••••••••••••••••" />
            <Secret label="Webhook Secret" placeholder="••••••••••••••••" />
            <p className="text-[0.68rem] leading-relaxed text-muted">
              Keys belong in environment variables, never in the database. This
              form will write to the server&apos;s secret store once the backend exists.
            </p>
          </div>
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

function Secret({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2.5 rounded-lg border border-hairline bg-card px-3.5 focus-within:border-series-1">
        <KeyRound className="size-4 shrink-0 text-muted" />
        <input
          type="password"
          placeholder={placeholder}
          className="w-full bg-transparent py-2.5 text-[0.8rem] text-ink placeholder:text-muted focus:outline-none"
        />
      </div>
    </div>
  );
}
