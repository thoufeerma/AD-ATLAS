"use client";

import { useRef, useState } from "react";
import { AlertCircle, Check, Loader2, Upload } from "lucide-react";
import { uploadImage, ApiError } from "@/lib/api/client";
import type { MediaAsset } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type Job = { name: string; state: "uploading" | "done" | "failed"; message?: string };

/**
 * Drop zone + file picker. Uploads one file at a time and reports each; the
 * API checks and re-encodes every image, so any file can be offered here.
 */
export default function Uploader({
  onUploaded,
  compact = false,
}: {
  onUploaded: (asset: MediaAsset) => void;
  compact?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);

  async function send(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length) return;
    setJobs(list.map((f) => ({ name: f.name, state: "uploading" })));
    for (const [i, file] of list.entries()) {
      try {
        const asset = await uploadImage<MediaAsset>(file);
        setJobs((js) => js.map((j, n) => (n === i ? { ...j, state: "done" } : j)));
        onUploaded(asset);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Upload failed — check your connection.";
        setJobs((js) => js.map((j, n) => (n === i ? { ...j, state: "failed", message } : j)));
      }
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void send(e.dataTransfer.files);
        }}
        className={cn(
          "grid w-full place-items-center rounded-[var(--radius-card)] border border-dashed bg-card px-4 text-center transition-colors",
          compact ? "py-5" : "py-10",
          over ? "border-series-1 bg-series-1/5" : "border-hairline hover:border-series-1",
        )}
      >
        <Upload className="size-6 text-muted" />
        <span className="mt-2 text-[0.82rem] text-ink">Drop images here, or click to choose</span>
        <span className="mt-1 text-[0.7rem] text-muted">
          JPG, PNG, WebP, AVIF or GIF · saved as optimised WebP, up to 2400px · photo location data removed
        </span>
      </button>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files) void send(e.target.files);
          e.target.value = "";
        }}
      />
      {jobs.length > 0 && (
        <ul className="mt-3 space-y-1">
          {jobs.map((j, i) => (
            <li key={i} className="flex items-center gap-2 text-[0.74rem]">
              {j.state === "uploading" ? (
                <Loader2 className="size-3.5 animate-spin text-muted" />
              ) : j.state === "done" ? (
                <Check className="size-3.5 text-good" />
              ) : (
                <AlertCircle className="size-3.5 text-critical" />
              )}
              <span className="truncate text-ink">{j.name}</span>
              {j.message && <span className="text-critical">— {j.message}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
