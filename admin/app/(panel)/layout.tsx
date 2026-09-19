import { unstable_rethrow } from "next/navigation";
import { KeyRound } from "lucide-react";
import Shell from "@/components/layout/Shell";
import ChangePasswordForm from "@/components/account/ChangePasswordForm";
import { apiGet, requireAdmin } from "@/lib/api/server";
import type { InboxCounts } from "@/lib/api/types";

/**
 * Every panel screen renders inside this layout, which asks the API who is
 * signed in before anything is shown. No valid session → redirect to /login.
 */
export default async function PanelLayout({ children }: LayoutProps<"/">) {
  const admin = await requireAdmin();

  // Temporary or placeholder password: nothing else until they choose their
  // own. (The API refuses every other request too; this is the friendly face.)
  if (admin.mustChangePassword) {
    return (
      <Shell admin={admin}>
        <div className="mx-auto max-w-md rounded-[var(--radius-card)] border border-hairline bg-card p-7">
          <span className="grid size-11 place-items-center rounded-full bg-series-1/10">
            <KeyRound className="size-5 text-series-1" />
          </span>
          <h1 className="mt-4 text-[1.15rem] font-semibold text-ink">Choose your own password</h1>
          <p className="mt-1.5 text-[0.8rem] leading-relaxed text-ink-2">
            You signed in with a temporary password. Set one only you know before using the
            admin panel.
          </p>
          <div className="mt-6">
            <ChangePasswordForm email={admin.email} submitLabel="Set Password & Continue" />
          </div>
        </div>
      </Shell>
    );
  }

  // Open inbox items for the sidebar badge. Never worth breaking the panel over.
  const inbox = await apiGet<InboxCounts>("/admin/inbox/counts").catch((err: unknown) => {
    unstable_rethrow(err); // but still honour an expired-session redirect
    return null;
  });
  return (
    <Shell admin={admin} badges={{ "/inbox": inbox?.total ?? 0 }}>
      {children}
    </Shell>
  );
}
