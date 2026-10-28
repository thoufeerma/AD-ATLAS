import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import CollaboratorNav from "@/components/collaborators/CollaboratorNav";
import CollaboratorsList from "@/components/collaborators/CollaboratorsList";
import { apiGet, requireAdmin } from "@/lib/api/server";
import { can, type Collaborator } from "@/lib/api/types";

export const metadata: Metadata = { title: "Collaborators" };

export default async function Page() {
  const [admin, collaborators] = await Promise.all([
    requireAdmin(),
    apiGet<Collaborator[]>("/admin/collaborators"),
  ]);

  const isSuperAdmin = can.manageCollaboratorMoney(admin.role);

  return (
    <>
      <PageHeader
        title="Collaborator & Partner Program"
        subtitle="Manage approved creators, commission rates, and track live referral performance"
      />
      <CollaboratorNav />
      <CollaboratorsList initial={collaborators} isSuperAdmin={isSuperAdmin} />
    </>
  );
}
