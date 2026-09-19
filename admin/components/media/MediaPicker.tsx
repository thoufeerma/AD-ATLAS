"use client";

import { useEffect, useState } from "react";
import { ImageIcon, Loader2, X } from "lucide-react";
import Uploader from "./Uploader";
import { api } from "@/lib/api/client";
import type { MediaAsset } from "@/lib/api/types";
import { imageSrc } from "@/lib/utils";

/**
 * Choose an image from the Media Library (or upload one) for a form field.
 * Opens as a dialog; picking closes it.
 */
export function MediaPicker({ onPick, onClose }: { onPick: (asset: MediaAsset) => void; onClose: () => void }) {
  const [assets, setAssets] = useState<MediaAsset[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<MediaAsset[]>("GET", "/admin/media")
      .then(setAssets)
      .catch(() => setError("Couldn't load the library."));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choose an image"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-[var(--radius-card)] bg-card shadow-xl"
      >
        <header className="flex items-center justify-between border-b border-hairline px-5 py-3.5">
          <h2 className="text-[0.92rem] font-semibold text-ink">Choose an image</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted hover:text-ink">
            <X className="size-5" />
          </button>
        </header>
        <div className="space-y-4 overflow-y-auto p-5">
          {/* A new upload is picked straight away — that's almost always why it was uploaded. */}
          <Uploader compact onUploaded={onPick} />
          {error ? (
            <p className="text-[0.78rem] text-critical">{error}</p>
          ) : !assets ? (
            <Loader2 className="mx-auto size-5 animate-spin text-muted" />
          ) : assets.length === 0 ? (
            <p className="text-center text-[0.78rem] text-ink-2">The library is empty — upload an image above.</p>
          ) : (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {assets.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => onPick(a)}
                    title={a.alt ?? a.filename}
                    className="group block w-full overflow-hidden rounded-lg border border-hairline hover:border-series-1"
                  >
                    <span className="block aspect-square bg-plane">
                      {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                      <img src={imageSrc(a.url)} alt="" className="size-full object-contain" loading="lazy" />
                    </span>
                    <span className="block truncate px-1.5 py-1 text-[0.62rem] text-ink-2 group-hover:text-series-1">
                      {a.filename}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * An image field: the path, a preview, and a button to pick from the
 * library. Typing a path still works (e.g. the original catalog images).
 */
export function ImageField({
  value,
  onChange,
  onPickAlt,
  invalid,
  label,
}: {
  value: string;
  onChange: (url: string) => void;
  /** Also receive the picked image's alt text, if the form has an alt field. */
  onPickAlt?: (alt: string) => void;
  invalid?: boolean;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg border border-hairline bg-plane">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin preview
          <img src={imageSrc(value)} alt="" className="size-full object-contain" />
        ) : (
          <ImageIcon className="size-4 text-muted" />
        )}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        placeholder="Choose from the library, or paste a path"
        className={`min-w-0 flex-1 rounded-lg border bg-card px-3 py-2 text-[0.78rem] text-ink placeholder:text-muted focus:outline-none ${
          invalid ? "border-critical" : "border-hairline focus:border-series-1"
        }`}
      />
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 rounded-lg border border-hairline px-3 py-2 text-[0.74rem] font-medium text-ink hover:border-series-1 hover:text-series-1"
      >
        Choose…
      </button>
      {open && (
        <MediaPicker
          onClose={() => setOpen(false)}
          onPick={(a) => {
            onChange(a.url);
            if (a.alt) onPickAlt?.(a.alt);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
