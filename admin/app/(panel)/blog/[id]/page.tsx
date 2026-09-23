import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import BlogForm from "@/components/blog/BlogForm";
import { ApiError, apiGet, requireAdmin } from "@/lib/api/server";
import { can, type BlogPost } from "@/lib/api/types";

export async function generateMetadata({ params }: PageProps<"/blog/[id]">): Promise<Metadata> {
  const { id } = await params;
  try {
    const post = await apiGet<BlogPost>(`/admin/blog/${id}`);
    return { title: post.title };
  } catch {
    return { title: "Post" };
  }
}

export default async function EditBlogPostPage({ params }: PageProps<"/blog/[id]">) {
  const admin = await requireAdmin();
  if (!can.editContent(admin.role)) redirect("/blog");

  const { id } = await params;
  let post: BlogPost;
  try {
    post = await apiGet<BlogPost>(`/admin/blog/${encodeURIComponent(id)}`);
  } catch (err) {
    // Only a genuine 404 becomes the not-found page; an expired session must
    // keep propagating so the redirect to the login page happens.
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return <BlogForm mode="edit" post={post} />;
}
