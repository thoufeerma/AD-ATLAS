"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { ImageField } from "@/components/media/MediaPicker";

export type FieldSpec = {
  name: string;
  label: string;
  /** "image" is a path, with a preview and a Media Library picker. */
  kind: "text" | "textarea" | "int" | "checkbox" | "rating" | "dateStart" | "dateEnd" | "image";
  required?: boolean;
  placeholder?: string;
  hint?: string;
  /** Starting value on a create form, e.g. `true` for "Published". */
  defaultValue?: string | boolean;
};

type Values = Record<string, string | boolean>;

/** API value → what the input holds. */
function toInput(spec: FieldSpec, value: unknown): string | boolean {
  if (spec.kind === "checkbox") return Boolean(value);
  if (value == null) return "";
  if (spec.kind === "dateStart" || spec.kind === "dateEnd") {
    const d = new Date(String(value));
    return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
  }
  return String(value);
}

/** What the input holds → the value the API expects. */
function toApi(spec: FieldSpec, raw: string | boolean): unknown {
  if (spec.kind === "checkbox") return Boolean(raw);
  const s = String(raw).trim();
  if (spec.kind === "int" || spec.kind === "rating") return s === "" ? 0 : Number(s);
  // Dates are whole days: a start is the beginning of it, an end is the end
  // of it — so an offer "ending 31 Dec" still runs on 31 Dec.
  if (spec.kind === "dateStart") return s ? new Date(`${s}T00:00:00`).toISOString() : null;
  if (spec.kind === "dateEnd") return s ? new Date(`${s}T23:59:59`).toISOString() : null;
  return s === "" && !spec.required ? null : s;
}

/**
 * Create or edit form for simple CMS resources, driven by field specs.
 * In edit mode only fields whose value actually changed are sent, so a PATCH
 * never touches data the admin didn't edit.
 */
export default function ResourceForm({
  fields,
  method,
  path,
  initial,
  submitLabel,
  onDone,
  onCancel,
}: {
  fields: FieldSpec[];
  method: "POST" | "PATCH";
  path: string;
  initial?: Record<string, unknown>;
  submitLabel: string;
  onDone?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const start = (): Values =>
    Object.fromEntries(
      fields.map((f) => [f.name, toInput(f, initial ? initial[f.name] : f.defaultValue)]),
    );
  const [values, setValues] = useState<Values>(start);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const set = (name: string, v: string | boolean) => setValues((s) => ({ ...s, [name]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const body: Record<string, unknown> = {};
    for (const f of fields) {
      const next = toApi(f, values[f.name]!);
      if (method === "PATCH") {
        const was = initial ? toApi(f, toInput(f, initial[f.name])) : undefined;
        if (JSON.stringify(next) === JSON.stringify(was)) continue;
      }
      body[f.name] = next;
    }
    if (method === "PATCH" && Object.keys(body).length === 0) {
      onDone?.();
      return;
    }

    setBusy(true);
    try {
      await api(method, path, body);
      if (method === "POST") setValues(start());
      router.refresh();
      onDone?.();
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.fields);
        setError(err.status === 400 ? "Fix the highlighted fields." : err.message);
      } else {
        setError("Couldn't save. Try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  const cls = (name: string) =>
    cn(
      "w-full rounded-lg border bg-card px-3.5 py-2.5 text-[0.8rem] text-ink placeholder:text-muted focus:outline-none",
      fieldErrors[name] ? "border-critical" : "border-hairline focus:border-series-1",
    );

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {error && (
        <p role="alert" className="flex items-center gap-2 text-[0.76rem] text-critical">
          <AlertCircle className="size-4 shrink-0" /> {error}
        </p>
      )}

      {fields.map((f) =>
        f.kind === "checkbox" ? (
          <label key={f.name} className="flex cursor-pointer items-center justify-between gap-4">
            <span className="text-[0.78rem] text-ink-2">{f.label}</span>
            <input
              type="checkbox"
              checked={Boolean(values[f.name])}
              onChange={(e) => set(f.name, e.target.checked)}
              className="size-4 accent-[var(--color-series-1)]"
            />
          </label>
        ) : (
          // An image field holds several controls (and opens a dialog), so it
          // can't sit inside a <label>; its input carries its own aria-label.
          <FieldWrap key={f.name} image={f.kind === "image"}>
            <span className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">
              {f.label}
              {f.required && " *"}
            </span>
            {f.kind === "image" ? (
              <ImageField
                label={f.label}
                value={String(values[f.name])}
                invalid={!!fieldErrors[f.name]}
                onChange={(url) => set(f.name, url)}
              />
            ) : f.kind === "textarea" ? (
              <textarea rows={4} value={String(values[f.name])} onChange={(e) => set(f.name, e.target.value)} placeholder={f.placeholder} className={cls(f.name)} />
            ) : f.kind === "rating" ? (
              <select value={String(values[f.name] || "5")} onChange={(e) => set(f.name, e.target.value)} className={cls(f.name)}>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{"★".repeat(n)} ({n})</option>
                ))}
              </select>
            ) : (
              <input
                type={f.kind === "dateStart" || f.kind === "dateEnd" ? "date" : "text"}
                inputMode={f.kind === "int" ? "numeric" : undefined}
                value={String(values[f.name])}
                onChange={(e) => set(f.name, e.target.value)}
                placeholder={f.placeholder}
                className={cls(f.name)}
              />
            )}
            {fieldErrors[f.name] ? (
              <span className="mt-1 block text-[0.7rem] text-critical">{fieldErrors[f.name]}</span>
            ) : f.hint ? (
              <span className="mt-1 block text-[0.68rem] text-muted">{f.hint}</span>
            ) : null}
          </FieldWrap>
        ),
      )}

      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={busy}>
          {busy && <Loader2 className="size-3.5 animate-spin" />}
          {busy ? "Saving…" : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

function FieldWrap({ image, children }: { image: boolean; children: React.ReactNode }) {
  return image ? <div className="block">{children}</div> : <label className="block">{children}</label>;
}
