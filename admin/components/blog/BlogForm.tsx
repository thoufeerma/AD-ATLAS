"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Check, ExternalLink, Loader2, Save, Trash2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ImageField } from "@/components/media/MediaPicker";
import { api, ApiError } from "@/lib/api/client";
import type { BlogPost, PublishStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL ?? "http://localhost:3000";

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

/** A datetime-local value ("2026-09-30T18:30") from an ISO string, in local time. */
function forInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const STATUSES: { value: PublishStatus; label: string; note: string }[] = [
  { value: "DRAFT", label: "Draft", note: "Only you can see it" },
  { value: "PUBLISHED", label: "Published", note: "Live on the storefront" },
  { value: "SCHEDULED", label: "Scheduled", note: "Goes live on the date below" },
];

type Props = { mode: "create"; post?: undefined } | { mode: "edit"; post: BlogPost };

export default function BlogForm({ mode, post }: Props) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [author, setAuthor] = useState(post?.author ?? "");
  const [coverUrl, setCoverUrl] = useState(post?.coverUrl ?? "");
  const [status, setStatus] = useState<PublishStatus>(post?.status ?? "DRAFT");
  const [publishedAt, setPublishedAt] = useState(forInput(post?.publishedAt ?? null));

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  const effectiveSlug = slugTouched ? slug : slugify(title);
  const words = body.trim() ? body.trim().split(/\s+/).length : 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFields({});
    setSaved(false);

    const local: Record<string, string> = {};
    if (title.trim().length < 2) local.title = "Give the post a title";
    if (body.trim().length < 10) local.body = "Write the post first";
    if (author.trim().length < 2) local.author = "Who wrote it?";
    if (status === "SCHEDULED" && !publishedAt) local.publishedAt = "Choose when it goes live";
    if (Object.keys(local).length) {
      setFields(local);
      setError("Fix the highlighted fields.");
      return;
    }

    const payload = {
      title: title.trim(),
      slug: effectiveSlug,
      excerpt: excerpt.trim() || null,
      body: body.trim(),
      author: author.trim(),
      coverUrl: coverUrl.trim() || null,
      status,
      publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await api("PATCH", `/admin/blog/${post.id}`, payload);
        setSaved(true);
        router.refresh();
      } else {
        const created = await api<{ id: string }>("POST", "/admin/blog", payload);
        router.push(`/blog/${created.id}`);
        router.refresh();
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setFields(err.fields);
        setError(Object.keys(err.fields).length ? "Fix the highlighted fields." : err.message);
      } else {
        setError("Couldn't save. Try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!isEdit || !window.confirm(`Delete “${post.title}”? This can't be undone.`)) return;
    setDeleting(true);
    try {
      await api("DELETE", `/admin/blog/${post.id}`);
      router.push("/blog");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <Link href="/blog" className="mb-4 inline-flex items-center gap-1.5 text-[0.76rem] text-ink-2 hover:text-ink">
        <ArrowLeft className="size-3.5" /> Back to posts
      </Link>

      <PageHeader
        title={isEdit ? post.title : "New Post"}
        subtitle={isEdit ? `/blog/${post.slug}` : "Written here, read on the storefront's Journal"}
        actions={
          <>
            {isEdit && post.status !== "DRAFT" && (
              <a
                href={`${STORE_URL}/blog/${post.slug}`}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-2 text-[0.74rem] font-medium text-ink hover:border-series-1 hover:text-series-1"
              >
                <ExternalLink className="size-3.5" /> View
              </a>
            )}
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Post"}
            </Button>
          </>
        }
      />

      {error && (
        <p role="alert" className="mb-4 flex items-center gap-2 rounded-lg bg-critical/10 px-3.5 py-2.5 text-[0.76rem] text-critical">
          <AlertCircle className="size-4 shrink-0" /> {error}
        </p>
      )}
      {saved && (
        <p role="status" className="mb-4 flex items-center gap-2 rounded-lg bg-good/10 px-3.5 py-2.5 text-[0.76rem] text-ink">
          <Check className="size-4 shrink-0" /> Saved — live on the store within a minute
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <Card title="Post">
            <div className="space-y-4">
              <Field label="Title *" error={fields.title}>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="How to find your perfect nude shade"
                  className={inputCls(fields.title)}
                />
              </Field>
              <Field label="Web Address" error={fields.slug} hint={`velastia.com/blog/${effectiveSlug || "…"}`}>
                <input
                  value={effectiveSlug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value);
                  }}
                  className={inputCls(fields.slug)}
                />
              </Field>
              <Field
                label="Teaser"
                error={fields.excerpt}
                hint="One or two lines, shown on the blog index and in link previews."
              >
                <textarea
                  rows={2}
                  value={excerpt}
                  maxLength={300}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className={inputCls(fields.excerpt)}
                />
              </Field>
            </div>
          </Card>

          <Card title="Body">
            <textarea
              rows={22}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={"Write in plain paragraphs, with a blank line between them.\n\n## A heading looks like this\n\n- A bullet looks like this"}
              className={cn(inputCls(fields.body), "font-mono text-[0.78rem] leading-relaxed")}
            />
            <p className="mt-1.5 flex items-center justify-between gap-3 text-[0.68rem] text-muted">
              <span>
                Blank line between paragraphs. <code className="rounded bg-plane px-1">## </code> starts a heading,{" "}
                <code className="rounded bg-plane px-1">- </code> a bullet.
              </span>
              <span className="tnum shrink-0">
                {words} {words === 1 ? "word" : "words"} · about {Math.max(1, Math.round(words / 200))} min read
              </span>
            </p>
            {fields.body && <p className="mt-1 text-[0.7rem] text-critical">{fields.body}</p>}
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Publishing">
            <div className="space-y-4">
              <Field label="Status" error={fields.status}>
                <select value={status} onChange={(e) => setStatus(e.target.value as PublishStatus)} className={inputCls()}>
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label} — {s.note}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label={status === "SCHEDULED" ? "Goes Live *" : "Publish Date"}
                error={fields.publishedAt}
                hint={status === "DRAFT" ? "Set when you publish it." : "Shown on the post."}
              >
                <input
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className={inputCls(fields.publishedAt)}
                />
              </Field>
              <Field label="Author *" error={fields.author}>
                <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Who wrote it" className={inputCls(fields.author)} />
              </Field>
            </div>
          </Card>

          <Card title="Cover Image">
            <ImageField label="Cover image" value={coverUrl} onChange={setCoverUrl} invalid={!!fields.coverUrl} />
            <p className="mt-2 text-[0.68rem] leading-relaxed text-muted">
              Shown at the top of the post, on the blog index, and when the link is shared. Landscape works best.
            </p>
          </Card>

          {isEdit && (
            <Card title="Danger Zone">
              <Button type="button" variant="outline" size="sm" onClick={remove} disabled={deleting}>
                {deleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                {deleting ? "Deleting…" : "Delete post"}
              </Button>
            </Card>
          )}
        </div>
      </div>
    </form>
  );
}

const inputCls = (error?: string) =>
  cn(
    "w-full rounded-lg border bg-card px-3.5 py-2.5 text-[0.8rem] text-ink placeholder:text-muted focus:outline-none",
    error ? "border-critical" : "border-hairline focus:border-series-1",
  );

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-[0.7rem] text-critical">{error}</span>
      ) : hint ? (
        <span className="mt-1 block truncate text-[0.68rem] text-muted">{hint}</span>
      ) : null}
    </label>
  );
}
