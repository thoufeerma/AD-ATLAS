"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api/client";

/** Edit toggle + confirmed delete, for list rows of simple CMS resources. */
export default function RowActions({
  path,
  label,
  onEdit,
}: {
  /** e.g. "/admin/faqs/abc123" */
  path: string;
  /** Human name used in the confirm dialog and aria labels. */
  label: string;
  onEdit?: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!window.confirm(`Delete ${label}? This can't be undone.`)) return;
    setBusy(true);
    try {
      await api("DELETE", path);
      router.refresh();
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : "Couldn't delete");
      setBusy(false);
    }
  }

  const btn = "grid size-8 place-items-center rounded-lg border border-hairline text-muted disabled:opacity-40";
  return (
    <span className="inline-flex gap-1.5">
      {onEdit && (
        <button type="button" onClick={onEdit} aria-label={`Edit ${label}`} className={`${btn} hover:border-series-1 hover:text-series-1`}>
          <Pencil className="size-3.5" />
        </button>
      )}
      <button type="button" onClick={remove} disabled={busy} aria-label={`Delete ${label}`} className={`${btn} hover:border-critical hover:text-critical`}>
        <Trash2 className="size-3.5" />
      </button>
    </span>
  );
}
