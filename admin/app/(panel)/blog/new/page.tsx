import type { Metadata } from "next";
import { redirect } from "next/navigation";
import BlogForm from "@/components/blog/BlogForm";
import { requireAdmin } from "@/lib/api/server";
import { can } from "@/lib/api/types";

export const metadata: Metadata = { title: "New Post" };

export default async function NewBlogPostPage() {
  const admin = await requireAdmin();
  if (!can.editContent(admin.role)) redirect("/blog");
  return <BlogForm mode="create" />;
}
