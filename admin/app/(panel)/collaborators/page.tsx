import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import { CollaboratorsManager } from "@/components/content/Managers";
import { apiGet } from "@/lib/api/server";
import type { Collaborator } from "@/lib/api/types";

export const metadata: Metadata = { title: "Collaborators" };

export default async function Page() {
  const collaborators = await apiGet<Collaborator[]>("/admin/collaborators");
  return (
    <>
      <PageHeader
        title="Collaborators"
        subtitle="Shown on the homepage, and with their quotes on the Collabs page"
      />
      <CollaboratorsManager collaborators={collaborators} />
    </>
  );
}
