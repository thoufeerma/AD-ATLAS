"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Check, X, Loader2, AlertCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import LiveToggle from "@/components/ui/LiveToggle";
import { api, ApiError } from "@/lib/api/client";
import type { Category } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const inputCls = (err?: string) =>
  cn(
    "w-full rounded-lg border bg-card px-3.5 py-2.5 text-[0.8rem] text-ink placeholder:text-muted focus:outline-none",
    err ? "border-critical" : "border-hairline focus:border-series-1",
  );

function Row({ category }: { category: Category }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [sortOrder, setSortOrder] = useState(String(category.sortOrder));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const count = category.productCount ?? 0;

  async function save() {
    setBusy(true);
    setError(null);
    try {
      // Only the fields being edited are sent; visibility is left untouched.
      await api("PATCH", `/admin/categories/${category.id}`, {
        name: name.trim(),
        sortOrder: Number(sortOrder) || 0,
      });
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? (err.fields.name ?? err.message) : "Couldn't save");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Delete the "${category.name}" category?`)) return;
    setBusy(true);
    try {
      await api("DELETE", `/admin/categories/${category.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't delete");
      setBusy(false);
    }
  }

  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-center gap-3">
        {editing ? (
          <>
            <input
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              aria-label="Sort order"
              inputMode="numeric"
              className={cn(inputCls(), "tnum w-16")}
            />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Category name"
              autoFocus
              className={cn(inputCls(), "min-w-0 flex-1")}
            />
            <button onClick={save} disabled={busy || name.trim().length < 2} aria-label="Save" className="grid size-8 place-items-center rounded-lg bg-series-1 text-white disabled:opacity-40">
              {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
            </button>
            <button onClick={() => { setEditing(false); setName(category.name); setSortOrder(String(category.sortOrder)); setError(null); }} aria-label="Cancel" className="grid size-8 place-items-center rounded-lg border border-hairline text-muted hover:text-ink">
              <X className="size-3.5" />
            </button>
          </>
        ) : (
          <>
            <span className="tnum grid size-8 shrink-0 place-items-center rounded-lg bg-plane text-[0.72rem] font-medium text-ink-2">
              {category.sortOrder}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[0.85rem] font-medium text-ink">{category.name}</p>
              <p className="text-[0.68rem] text-muted">/shop?category={category.slug}</p>
            </div>
            <Badge tone="neutral" dot={false}>
              {count} product{count === 1 ? "" : "s"}
            </Badge>
            <LiveToggle on={category.isVisible} label={`Show ${category.name} on the storefront`} path={`/admin/categories/${category.id}`} field="isVisible" />
            <button onClick={() => setEditing(true)} aria-label={`Edit ${category.name}`} className="grid size-8 place-items-center rounded-lg border border-hairline text-muted hover:border-series-1 hover:text-series-1">
              <Pencil className="size-3.5" />
            </button>
            <button
              onClick={remove}
              disabled={busy || count > 0}
              aria-label={`Delete ${category.name}`}
              title={count > 0 ? "Move or archive its products first" : "Delete"}
              className="grid size-8 place-items-center rounded-lg border border-hairline text-muted hover:border-critical hover:text-critical disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-hairline disabled:hover:text-muted"
            >
              <Trash2 className="size-3.5" />
            </button>
          </>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-[0.72rem] text-critical">{error}</p>
      )}
    </li>
  );
}

function CreateCategory() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [visible, setVisible] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  const effectiveSlug = slugTouched ? slug : slugify(name);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setFields({});
    try {
      await api("POST", "/admin/categories", {
        name: name.trim(),
        slug: effectiveSlug,
        description: description.trim() || null,
        isVisible: visible,
        sortOrder: 99,
      });
      setName(""); setSlug(""); setSlugTouched(false); setDescription(""); setVisible(true);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setFields(err.fields);
        setError(err.status === 400 ? null : err.message);
      } else setError("Couldn't create the category.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="Add Category">
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error && (
          <p role="alert" className="flex items-center gap-2 text-[0.76rem] text-critical">
            <AlertCircle className="size-4 shrink-0" /> {error}
          </p>
        )}
        <label className="block">
          <span className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">Name *</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Fragrance" className={inputCls(fields.name)} />
          {fields.name && <span className="mt-1 block text-[0.7rem] text-critical">{fields.name}</span>}
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">Slug</span>
          <input value={effectiveSlug} onChange={(e) => { setSlugTouched(true); setSlug(e.target.value); }} placeholder="fragrance" className={inputCls(fields.slug)} />
          {fields.slug && <span className="mt-1 block text-[0.7rem] text-critical">{fields.slug}</span>}
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">Description</span>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls(fields.description)} />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-4">
          <span className="text-[0.78rem] text-ink-2">Visible on storefront</span>
          <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} className="size-4 accent-[var(--color-series-1)]" />
        </label>
        <Button type="submit" className="w-full" disabled={busy || name.trim().length < 2}>
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
          {busy ? "Creating…" : "Create Category"}
        </Button>
      </form>
    </Card>
  );
}

export default function CategoriesManager({ categories }: { categories: Category[] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
      <Card title="All Categories" bodyClassName="p-0">
        {categories.length === 0 ? (
          <p className="px-5 py-10 text-center text-[0.8rem] text-ink-2">No categories yet.</p>
        ) : (
          <ul className="divide-y divide-hairline">
            {categories.map((c) => (
              <Row key={c.id} category={c} />
            ))}
          </ul>
        )}
      </Card>
      <CreateCategory />
    </div>
  );
}
