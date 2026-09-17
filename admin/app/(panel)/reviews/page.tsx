import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import ReviewsTable from "@/components/reviews/ReviewsTable";
import { apiGet } from "@/lib/api/server";
import type { Review } from "@/lib/api/types";

export const metadata: Metadata = { title: "Reviews" };

export default async function ReviewsPage() {
  const reviews = await apiGet<Review[]>("/admin/reviews");
  const pending = reviews.filter((r) => r.status === "PENDING").length;

  return (
    <>
      <PageHeader
        title="Reviews"
        subtitle={
          pending > 0
            ? `${pending} awaiting moderation · only published reviews appear on the storefront`
            : "Nothing waiting · only published reviews appear on the storefront"
        }
      />
      <ReviewsTable reviews={reviews} />
    </>
  );
}
