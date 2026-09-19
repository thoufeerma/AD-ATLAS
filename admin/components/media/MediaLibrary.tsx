"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Link2, Search, Trash2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Uploader from "./Uploader";
import { api, ApiError } from "@/lib/api/client";
import type { MediaAsset } from "@/lib/api/types";
import { cn, imageSrc } from "@/lib/utils";

const kb = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`);

export default function MediaLibrary({ assets }: { assets: MediaAsset[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const shown = q
    ? assets.filter((a) => a.filename.toLowerCase().includes(q) || (a.alt ?? "").toLowerCase().includes(q))
    : assets;

  return (
    <div className="space-y-5">
      <Uploader onUploaded={() => router.refresh()} />

      <label className="relative block max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
        <span className="sr-only">Search</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or alt text…"
          className="w-full rounded-lg border border-hairline bg-card py-2 pl-9 pr-3 text-[0.78rem] text-ink placeholder:text-muted focus:border-series-1 focus:outline-none"
        />
      </label>

      {shown.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-hairline bg-card p-10 text-center text-[0.8rem] text-ink-2">
          {assets.length === 0 ? "No images yet — upload your first above." : "Nothing matches."}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((a) => (
            <AssetCard key={a.id} asset={a} />
          ))}
        </ul>
      )}
    </div>
  );
}

function AssetCard({ asset }: { asset: MediaAsset }) {
  const router = useRouter();
  const [alt, setAlt] = useState(asset.alt ?? "");
  const [savedAlt, setSavedAlt] = useState(asset.alt ?? "");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const used = asset.usedIn.length > 0;

  async function saveAlt() {
    if (alt.trim() === savedAlt) return;
    setError(null);
    try {
      const updated = await api<MediaAsset>("PATCH", `/admin/media/${asset.id}`, { alt: alt.trim() || null });
      setSavedAlt(updated.alt ?? "");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save");
    }
  }

  async function remove() {
    if (!window.confirm(`Delete “${asset.filename}”? This can't be undone.`)) return;
    setBusy(true);
    setError(null);
    try {
      await api("DELETE", `/admin/media/${asset.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't delete");
      setBusy(false);
    }
  }

  function copy() {
    navigator.clipboard
      ?.writeText(asset.url)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      })
      .catch(() => {});
  }

  return (
    <li className="overflow-hidden rounded-[var(--radius-card)] border border-hairline bg-card">
      <div className="relative aspect-4/3 bg-plane">
        {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of an uploaded file */}
        <img src={imageSrc(asset.url)} alt={savedAlt} className="size-full object-contain" loading="lazy" />
      </div>
      <div className="space-y-2.5 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 truncate text-[0.78rem] font-medium text-ink" title={asset.filename}>
            {asset.filename}
          </p>
          {used ? (
            <Badge tone="good" dot={false}>
              In use
            </Badge>
          ) : (
            <Badge tone="neutral" dot={false}>
              Unused
            </Badge>
          )}
        </div>
        <p className="text-[0.68rem] text-muted">
          {asset.width && asset.height ? `${asset.width}×${asset.height} · ` : ""}
          {kb(asset.sizeBytes)} · {new Date(asset.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </p>
        {used && (
          <p className="text-[0.66rem] leading-relaxed text-ink-2" title={asset.usedIn.join("\n")}>
            {asset.usedIn.slice(0, 2).join(" · ")}
            {asset.usedIn.length > 2 && ` +${asset.usedIn.length - 2} more`}
          </p>
        )}
        <label className="block">
          <span className="sr-only">Alt text for {asset.filename}</span>
          <input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            onBlur={saveAlt}
            onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
            maxLength={200}
            placeholder="Describe the image (alt text)"
            className="w-full rounded-md border border-hairline bg-card px-2.5 py-1.5 text-[0.72rem] text-ink placeholder:text-muted focus:border-series-1 focus:outline-none"
          />
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1 rounded-md border border-hairline px-2 py-1 text-[0.68rem] text-ink-2 hover:border-series-1 hover:text-series-1"
          >
            {copied ? <Check className="size-3" /> : <Link2 className="size-3" />} {copied ? "Copied" : "Copy link"}
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={busy || used}
            title={used ? "Remove it from where it's used first" : undefined}
            className={cn(
              "inline-flex items-center gap-1 rounded-md border border-hairline px-2 py-1 text-[0.68rem] text-muted",
              "hover:border-critical hover:text-critical disabled:opacity-40 disabled:hover:border-hairline disabled:hover:text-muted",
            )}
          >
            <Trash2 className="size-3" /> Delete
          </button>
        </div>
        {error && <p className="text-[0.68rem] text-critical">{error}</p>}
      </div>
    </li>
  );
}
