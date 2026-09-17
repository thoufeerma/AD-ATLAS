import Shell from "@/components/layout/Shell";
import { requireAdmin } from "@/lib/api/server";

/**
 * Every panel screen renders inside this layout, which asks the API who is
 * signed in before anything is shown. No valid session → redirect to /login.
 */
export default async function PanelLayout({ children }: LayoutProps<"/">) {
  const admin = await requireAdmin();
  return <Shell admin={admin}>{children}</Shell>;
}
