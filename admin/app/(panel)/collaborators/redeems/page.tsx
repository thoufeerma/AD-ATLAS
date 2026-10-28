import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import CollaboratorNav from "@/components/collaborators/CollaboratorNav";
import RedeemRequestsView from "@/components/collaborators/RedeemRequestsView";
import { apiGet, requireAdmin } from "@/lib/api/server";
import { can, type AdminRedeemRequest } from "@/lib/api/types";

export const metadata: Metadata = { title: "Redeem Requests" };

export default async function Page() {
  const [admin, requests] = await Promise.all([
    requireAdmin(),
    apiGet<AdminRedeemRequest[]>("/admin/collaborators/redeems"),
  ]);

  const isSuperAdmin = can.manageCollaboratorMoney(admin.role);

  return (
    <>
      <PageHeader
        title="Redeem Requests"
        subtitle="Review, approve, and track collaborator commission payout requests"
      />
      <CollaboratorNav />
      <RedeemRequestsView initial={requests} isSuperAdmin={isSuperAdmin} />
    </>
  );
}
