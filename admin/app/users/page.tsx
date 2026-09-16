"use client";

import { UserPlus, ShieldCheck } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import DataTable, { type Column } from "@/components/ui/DataTable";
import { USERS, ROLES } from "@/lib/mock";

type User = (typeof USERS)[number];

const columns: Column<User>[] = [
  {
    key: "name",
    header: "User",
    cell: (u) => (
      <span className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sidebar text-[0.62rem] font-semibold text-pill">
          {u.name.split(" ").map((n) => n[0]).join("")}
        </span>
        <span className="min-w-0">
          <span className="block font-medium text-ink">{u.name}</span>
          <span className="block truncate text-[0.68rem] text-muted">{u.email}</span>
        </span>
      </span>
    ),
  },
  { key: "role", header: "Role" },
  { key: "lastActive", header: "Last Active" },
  {
    key: "active",
    header: "Status",
    value: (u) => (u.active ? "Active" : "Disabled"),
    cell: (u) => (
      <Badge tone={u.active ? "good" : "neutral"}>{u.active ? "Active" : "Disabled"}</Badge>
    ),
  },
  {
    key: "actions",
    header: "",
    sortable: false,
    align: "right",
    cell: () => (
      <button className="text-[0.72rem] font-medium text-series-1 hover:underline">
        Manage
      </button>
    ),
  },
];

export default function UsersPage() {
  return (
    <>
      <PageHeader
        title="Users & Roles"
        subtitle={`${USERS.filter((u) => u.active).length} active team members`}
        actions={
          <Button size="sm">
            <UserPlus className="size-3.5" /> Invite User
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <DataTable
          rows={USERS}
          columns={columns}
          rowKey={(u) => u.id}
          searchPlaceholder="Search team…"
        />

        <Card title="Roles">
          <ul className="space-y-4">
            {ROLES.map((r) => (
              <li key={r.name} className="rounded-xl border border-hairline p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="flex items-center gap-2 text-[0.84rem] font-medium text-ink">
                    <ShieldCheck className="size-4 text-series-1" />
                    {r.name}
                  </p>
                  <Badge tone="neutral" dot={false}>
                    {r.members} {r.members === 1 ? "member" : "members"}
                  </Badge>
                </div>
                <p className="mt-2 text-[0.72rem] leading-relaxed text-ink-2">
                  {r.permissions}
                </p>
              </li>
            ))}
          </ul>
          <Button variant="outline" size="sm" className="mt-4 w-full">
            Create Custom Role
          </Button>
        </Card>
      </div>
    </>
  );
}
