import { unstable_rethrow } from "next/navigation";
import Shell from "@/components/layout/Shell";
import { apiGet, requireAdmin } from "@/lib/api/server";
import type { InboxCounts } from "@/lib/api/types";

/**
 * Every panel screen renders inside this layout, which asks the API who is
 * signed in before anything is shown. No valid session → redirect to /login.
 */
export default async function PanelLayout({ children }: LayoutProps<"/">) {
  const admin = await requireAdmin();
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
