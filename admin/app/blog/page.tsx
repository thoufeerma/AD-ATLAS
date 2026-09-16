"use client";

import { Plus, Pencil } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge, { toneFor } from "@/components/ui/Badge";
import DataTable, { type Column } from "@/components/ui/DataTable";
import { BLOG_POSTS } from "@/lib/mock";
import { num } from "@/lib/utils";

type Post = (typeof BLOG_POSTS)[number];

const columns: Column<Post>[] = [
  {
    key: "title",
    header: "Title",
    cell: (p) => <span className="font-medium text-ink">{p.title}</span>,
  },
  { key: "author", header: "Author" },
  { key: "date", header: "Publish Date" },
  {
    key: "views",
    header: "Views",
    align: "right",
    cell: (p) => (p.views ? num(p.views) : "—"),
  },
  {
    key: "status",
    header: "Status",
    cell: (p) => <Badge tone={toneFor(p.status)}>{p.status}</Badge>,
  },
  {
    key: "actions",
    header: "",
    sortable: false,
    align: "right",
    cell: () => (
      <button className="inline-flex items-center gap-1 text-[0.72rem] font-medium text-series-1 hover:underline">
        <Pencil className="size-3" /> Edit
      </button>
    ),
  },
];

const filters = [
  { label: "Published", test: (p: Post) => p.status === "Published" },
  { label: "Scheduled", test: (p: Post) => p.status === "Scheduled" },
  { label: "Draft", test: (p: Post) => p.status === "Draft" },
];

export default function BlogPage() {
  const totalViews = BLOG_POSTS.reduce((n, p) => n + p.views, 0);

  return (
    <>
      <PageHeader
        title="Blog Posts"
        subtitle={`${num(totalViews)} total views across ${BLOG_POSTS.length} posts`}
        actions={
          <Button size="sm">
            <Plus className="size-3.5" /> Write Post
          </Button>
        }
      />
      <DataTable
        rows={BLOG_POSTS}
        columns={columns}
        rowKey={(p) => p.id}
        filters={filters}
        searchPlaceholder="Search posts…"
      />
    </>
  );
}
