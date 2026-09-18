"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api/client";
import type { PageDetail } from "@/lib/api/types";
import { cn, same } from "@/lib/utils";

const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL ?? "http://localhost:3000";

type Section = { heading: string; text: string };

/** Paragraphs are separated by a blank line in the editor. */
const toText = (body: string[]) => body.join("\n\n");
const toParagraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);

export default function PageEditor({
  page,
  tokenValues,
}: {
  page: PageDetail;
  /** What each {{token}} currently turns into on the storefront. */
  tokenValues: Record<string, string>;
}) {
  const router = useRouter();
  const start = () => ({
    title: page.title,
    lead: page.body.lead,
    sections: page.body.sections.map((s) => ({ heading: s.heading, text: toText(s.body) })),
    metaTitle: page.metaTitle ?? "",
    metaDescription: page.metaDescription ?? "",
  });
  const [draft, setDraft] = useState(start);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const payload = {
    title: draft.title.trim(),
    body: {
      lead: draft.lead.trim(),
      sections: draft.sections.map((s) => ({ heading: s.heading.trim(), body: toParagraphs(s.text) })),
    },
    metaTitle: draft.metaTitle.trim() || null,
    metaDescription: draft.metaDescription.trim() || null,
  };
  const original = {
    title: page.title,
    body: page.body,
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription,
  };
  const dirty = !same(payload, original);

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const problems = {
    title: payload.title.length < 2 ? "Give the page a title." : null,
    sections: payload.body.sections.map((s) =>
      s.heading.length < 2
        ? "Add a heading."
        : s.body.length === 0
          ? "Add at least one paragraph."
          : null,
    ),
  };
  const valid = !problems.title && problems.sections.every((p) => !p) && payload.body.sections.length > 0;

  const setSection = (i: number, patch: Partial<Section>) =>
    setDraft((d) => ({
      ...d,
      sections: d.sections.map((s, j) => (j === i ? { ...s, ...patch } : s)),
    }));
  const move = (i: number, by: -1 | 1) =>
    setDraft((d) => {
      const next = [...d.sections];
      const [s] = next.splice(i, 1);
      next.splice(i + by, 0, s!);
      return { ...d, sections: next };
    });
  const removeSection = (i: number) => {
    const s = draft.sections[i]!;
    if ((s.heading || s.text) && !window.confirm(`Remove the section “${s.heading || "untitled"}”?`)) return;
    setDraft((d) => ({ ...d, sections: d.sections.filter((_, j) => j !== i) }));
  };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) {
      setShowErrors(true);
      setError("Fix the highlighted fields.");
      return;
    }
    setBusy(true);
    setSaved(false);
    setError(null);
    try {
      await api("PATCH", `/admin/pages/${page.slug}`, payload);
      setSaved(true);
      setShowErrors(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError && err.status !== 400 ? err.message : "Couldn't save — check the fields and try again.");
    } finally {
      setBusy(false);
    }
  }

  function copyToken(t: string) {
    navigator.clipboard
      ?.writeText(`{{${t}}}`)
      .then(() => {
        setCopied(t);
        setTimeout(() => setCopied(null), 1400);
      })
      .catch(() => {});
  }

  const input =
    "w-full rounded-lg border bg-card px-3.5 py-2.5 text-[0.8rem] text-ink placeholder:text-muted focus:outline-none";
  const border = (bad: boolean) => (bad ? "border-critical" : "border-hairline focus:border-series-1");

  return (
    <form onSubmit={save} noValidate className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-5">
        <Card title="Page">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">Title *</span>
              <input
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                className={cn(input, border(showErrors && !!problems.title))}
              />
              {showErrors && problems.title && (
                <span className="mt-1 block text-[0.7rem] text-critical">{problems.title}</span>
              )}
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">Intro Line</span>
              <input
                value={draft.lead}
                maxLength={300}
                onChange={(e) => setDraft((d) => ({ ...d, lead: e.target.value }))}
                className={cn(input, border(false))}
              />
              <span className="mt-1 block text-[0.68rem] text-muted">Shown under the title in the page banner.</span>
            </label>
          </div>
        </Card>

        {draft.sections.map((s, i) => {
          const problem = showErrors ? problems.sections[i] : null;
          return (
            <Card key={i} bodyClassName="p-0">
              <div className="flex items-center justify-between gap-3 border-b border-hairline px-5 py-3">
                <span className="text-[0.72rem] font-semibold text-muted">
                  Section {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex items-center gap-1">
                  <IconButton label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                    <ArrowUp className="size-3.5" />
                  </IconButton>
                  <IconButton label="Move down" disabled={i === draft.sections.length - 1} onClick={() => move(i, 1)}>
                    <ArrowDown className="size-3.5" />
                  </IconButton>
                  <IconButton label="Remove section" onClick={() => removeSection(i)}>
                    <Trash2 className="size-3.5" />
                  </IconButton>
                </span>
              </div>
              <div className="space-y-3 p-5">
                <input
                  value={s.heading}
                  onChange={(e) => setSection(i, { heading: e.target.value })}
                  placeholder="Section heading"
                  aria-label={`Section ${i + 1} heading`}
                  className={cn(input, "font-medium", border(!!problem && s.heading.trim().length < 2))}
                />
                <textarea
                  value={s.text}
                  rows={Math.min(12, Math.max(4, s.text.split("\n").length + 1))}
                  onChange={(e) => setSection(i, { text: e.target.value })}
                  placeholder="Write the section. Leave a blank line between paragraphs."
                  aria-label={`Section ${i + 1} text`}
                  className={cn(input, "leading-relaxed", border(!!problem && s.heading.trim().length >= 2))}
                />
                {problem && <p className="text-[0.7rem] text-critical">{problem}</p>}
              </div>
            </Card>
          );
        })}

        <Button
          type="button"
          variant="outline"
          onClick={() => setDraft((d) => ({ ...d, sections: [...d.sections, { heading: "", text: "" }] }))}
        >
          <Plus className="size-3.5" /> Add Section
        </Button>
      </div>

      {/* Side panel */}
      <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
        <Card>
          <div className="space-y-3">
            <Button type="submit" className="w-full" disabled={busy || !dirty}>
              {busy && <Loader2 className="size-3.5 animate-spin" />}
              {busy ? "Saving…" : "Save Changes"}
            </Button>
            {error ? (
              <p role="alert" className="flex items-start gap-1.5 text-[0.72rem] text-critical">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" /> {error}
              </p>
            ) : saved && !dirty ? (
              <p role="status" className="flex items-center gap-1.5 text-[0.72rem] text-good">
                <Check className="size-3.5" /> Saved — live on the store within a minute
              </p>
            ) : dirty ? (
              <p className="text-[0.72rem] text-ink-2">You have unsaved changes.</p>
            ) : null}
            <a
              href={`${STORE_URL}/${page.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[0.72rem] text-ink-2 hover:text-ink"
            >
              View on store <ExternalLink className="size-3" />
            </a>
          </div>
        </Card>

        <Card title="Live Values">
          <p className="text-[0.7rem] leading-relaxed text-ink-2">
            Type these into any heading or paragraph and the store fills in the current value — so
            the policy stays right when settings change. Click to copy.
          </p>
          <ul className="mt-3 space-y-1.5">
            {page.tokens.map((t) => (
              <li key={t}>
                <button
                  type="button"
                  onClick={() => copyToken(t)}
                  className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left hover:bg-plane"
                >
                  <span className="min-w-0">
                    <code className="block truncate text-[0.7rem] text-series-1">{`{{${t}}}`}</code>
                    <span className="block truncate text-[0.68rem] text-muted">
                      {tokenValues[t] ?? "not set"}
                    </span>
                  </span>
                  {copied === t ? (
                    <Check className="size-3.5 shrink-0 text-good" />
                  ) : (
                    <Copy className="size-3.5 shrink-0 text-muted" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Search Engines">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">Meta Title</span>
              <input
                value={draft.metaTitle}
                maxLength={70}
                placeholder={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, metaTitle: e.target.value }))}
                className={cn(input, border(false))}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">Meta Description</span>
              <textarea
                rows={3}
                maxLength={170}
                value={draft.metaDescription}
                onChange={(e) => setDraft((d) => ({ ...d, metaDescription: e.target.value }))}
                className={cn(input, border(false))}
              />
              <span className="mt-1 block text-[0.68rem] text-muted">
                {draft.metaDescription.length}/170 · falls back to the intro line
              </span>
            </label>
          </div>
        </Card>
      </aside>
    </form>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-7 place-items-center rounded-md text-ink-2 hover:bg-plane hover:text-ink disabled:opacity-30"
    >
      {children}
    </button>
  );
}
