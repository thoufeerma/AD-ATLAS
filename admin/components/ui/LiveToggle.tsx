"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

/**
 * A switch bound to one boolean field of an API resource. Flips immediately,
 * saves in the background, and flips back with an explanation if the save
 * fails — the UI never shows a state that isn't stored.
 */
export default function LiveToggle({
  on,
  label,
  path,
  field,
}: {
  on: boolean;
  label: string;
  /** e.g. "/admin/faqs/abc123" */
  path: string;
  /** e.g. "isPublished" */
  field: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(on);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function flip() {
    const next = !value;
    setValue(next);
    setBusy(true);
    setError(null);
    try {
      await api("PATCH", path, { [field]: next });
      router.refresh();
    } catch (err) {
      setValue(!next);
      setError(err instanceof ApiError ? err.message : "Couldn't save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        disabled={busy}
        onClick={flip}
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-60",
          value ? "bg-series-1" : "bg-[#d6d3e0]",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform",
            value ? "translate-x-4.5" : "translate-x-0.5",
          )}
        />
      </button>
      {error && <span role="alert" className="max-w-[12rem] text-right text-[0.65rem] text-critical">{error}</span>}
    </span>
  );
}
