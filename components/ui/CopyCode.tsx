"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** A coupon code the shopper can copy with one tap. */
export default function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard
      ?.writeText(code)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => {});
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy code ${code}`}
      className="inline-flex items-center gap-2.5 rounded-sm border border-dashed border-gold-400 bg-cream-50 px-4 py-2.5 transition-colors hover:bg-cream-100"
    >
      <span className="label-caps text-[0.75rem] text-plum-800">{code}</span>
      {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5 text-gold-600" />}
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied" : ""}
      </span>
    </button>
  );
}
