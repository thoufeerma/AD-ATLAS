import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import CollaboratorNav from "@/components/collaborators/CollaboratorNav";
import ReferralsView from "@/components/collaborators/ReferralsView";
import { apiGet } from "@/lib/api/server";
import type { AdminReferral } from "@/lib/api/types";

export const metadata: Metadata = { title: "Collaborator Referrals" };

export default async function Page() {
  const referrals = await apiGet<AdminReferral[]>("/admin/collaborators/referrals");

  return (
    <>
      <PageHeader
        title="Commission & Referrals"
        subtitle="Track which store orders earned collaborator commission and their status"
      />
      <CollaboratorNav />
      <ReferralsView initial={referrals} />
    </>
  );
}
