import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import ChangePasswordForm from "@/components/account/ChangePasswordForm";
import { requireAdmin } from "@/lib/api/server";
import { ROLE_LABEL, ROLE_SUMMARY } from "@/lib/api/types";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountPage() {
  const admin = await requireAdmin();

  return (
    <>
      <PageHeader title="My Account" subtitle="Your sign-in details" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card title="Profile">
          <dl className="space-y-4 text-[0.8rem]">
            <div>
              <dt className="text-[0.7rem] font-medium text-ink-2">Name</dt>
              <dd className="mt-0.5 text-ink">{admin.name}</dd>
            </div>
            <div>
              <dt className="text-[0.7rem] font-medium text-ink-2">Email</dt>
              <dd className="mt-0.5 text-ink">{admin.email}</dd>
            </div>
            <div>
              <dt className="text-[0.7rem] font-medium text-ink-2">Role</dt>
              <dd className="mt-0.5 text-ink">{ROLE_LABEL[admin.role]}</dd>
              <dd className="mt-1 text-[0.72rem] leading-relaxed text-ink-2">{ROLE_SUMMARY[admin.role]}</dd>
            </div>
          </dl>
          <p className="mt-5 text-[0.7rem] text-muted">
            A super administrator can change your name or role under Users &amp; Roles.
          </p>
        </Card>

        <Card title="Change Password">
          <ChangePasswordForm email={admin.email} />
        </Card>
      </div>
    </>
  );
}
