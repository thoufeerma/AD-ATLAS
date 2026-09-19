import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import UsersManager from "@/components/users/UsersManager";
import { apiGet, requireAdmin } from "@/lib/api/server";
import { can, type AdminUserRow } from "@/lib/api/types";

export const metadata: Metadata = { title: "Users & Roles" };

export default async function UsersPage() {
  const admin = await requireAdmin();
  if (!can.editStore(admin.role)) {
    return (
      <>
        <PageHeader title="Users & Roles" />
        <p className="rounded-[var(--radius-card)] border border-hairline bg-card p-8 text-center text-[0.82rem] text-ink-2">
          Only super administrators can manage team accounts. You can change your own password
          under My Account.
        </p>
      </>
    );
  }

  const users = await apiGet<AdminUserRow[]>("/admin/users");
  const active = users.filter((u) => u.isActive).length;

  return (
    <>
      <PageHeader
        title="Users & Roles"
        subtitle={`${active} active ${active === 1 ? "account" : "accounts"} · accounts are turned off, never deleted, so their activity history stays intact`}
      />
      <UsersManager users={users} meId={admin.id} />
    </>
  );
}
