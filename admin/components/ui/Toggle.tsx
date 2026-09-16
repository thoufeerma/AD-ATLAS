"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Toggle({
  defaultOn = false,
  label,
}: {
  defaultOn?: boolean;
  label: string;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => setOn((v) => !v)}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full transition-colors",
        on ? "bg-series-1" : "bg-[#d6d3e0]",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform",
          on ? "translate-x-4.5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
