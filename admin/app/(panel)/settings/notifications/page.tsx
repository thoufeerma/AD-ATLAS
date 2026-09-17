"use client";

import { Save, Mail, MessageSquare, Bell } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Toggle from "@/components/ui/Toggle";
import { NOTIFICATION_PREFS } from "@/lib/mock";

const CHANNELS = [
  { key: "email" as const, label: "Email", Icon: Mail },
  { key: "sms" as const, label: "SMS", Icon: MessageSquare },
  { key: "push" as const, label: "Push", Icon: Bell },
];

export default function NotificationsPage() {
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <PageHeader
        title="Notifications"
        subtitle="Which events reach the team, and how"
        actions={
          <Button size="sm" type="submit">
            <Save className="size-3.5" /> Save Changes
          </Button>
        }
      />

      <Card bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-hairline">
                <th className="px-5 py-3.5 text-[0.68rem] font-semibold uppercase tracking-wider text-muted">
                  Event
                </th>
                {CHANNELS.map((c) => (
                  <th
                    key={c.key}
                    className="px-5 py-3.5 text-[0.68rem] font-semibold uppercase tracking-wider text-muted"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <c.Icon className="size-3.5" />
                      {c.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {NOTIFICATION_PREFS.map((n) => (
                <tr key={n.id} className="border-b border-hairline last:border-0">
                  <td className="px-5 py-4 text-[0.82rem] text-ink">{n.label}</td>
                  {CHANNELS.map((c) => (
                    <td key={c.key} className="px-5 py-4">
                      <Toggle defaultOn={n[c.key]} label={`${n.label} via ${c.label}`} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card title="Recipients">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">
                Order notifications go to
              </label>
              <input
                defaultValue="orders@velastia.com"
                className="w-full rounded-lg border border-hairline bg-card px-3.5 py-2.5 text-[0.8rem] text-ink focus:border-series-1 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">
                Inventory alerts go to
              </label>
              <input
                defaultValue="stock@velastia.com"
                className="w-full rounded-lg border border-hairline bg-card px-3.5 py-2.5 text-[0.8rem] text-ink focus:border-series-1 focus:outline-none"
              />
            </div>
          </div>
        </Card>

        <Card title="Digest">
          <ul className="space-y-4">
            {[
              { label: "Send a daily summary at 9:00 AM", on: true },
              { label: "Send a weekly digest on Monday", on: true },
              { label: "Include revenue figures in digests", on: true },
              { label: "Pause all notifications", on: false },
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
