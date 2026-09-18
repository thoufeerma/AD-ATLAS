"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api/client";
import { cn, looksLikeEmail } from "@/lib/utils";

type Fields = { name: string; email: string; handle: string; audienceSize: string; about: string };

function validate(f: Fields) {
  const errors: Partial<Record<keyof Fields, string>> = {};
  if (f.name.trim().length < 2) errors.name = "Enter your name.";
  if (!looksLikeEmail(f.email)) errors.email = "Enter a valid email address.";
  if (f.handle.trim().length < 2) errors.handle = "Enter your Instagram or YouTube handle.";
  if (f.audienceSize.trim().length > 40) errors.audienceSize = "Keep this short, e.g. 25,000.";
  if (f.about.trim().length < 10) errors.about = "Tell us a little more — at least 10 characters.";
  return errors;
}

/** Applications land in the admin's Collab Applications list. */
export default function CollabForm() {
  const [f, setF] = useState<Fields>({ name: "", email: "", handle: "", audienceSize: "", about: "" });
  const [showErrors, setShowErrors] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const errors = validate(f);
  const err = (k: keyof Fields) => (showErrors ? errors[k] : undefined);
  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (Object.keys(errors).length) {
      setShowErrors(true);
      return;
    }
    setSending(true);
    setError("");
    try {
      await api("POST", "/collab-applications", {
        name: f.name.trim(),
        email: f.email.trim(),
        handle: f.handle.trim(),
        audienceSize: f.audienceSize.trim() || null,
        about: f.about.trim(),
      });
      setDone(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div role="status" className="flex flex-col items-center justify-center text-center">
        <CheckCircle2 className="size-12 text-gold-400" strokeWidth={1.4} />
        <h3 className="mt-4 font-display text-2xl text-cream-50">Application received</h3>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-cream-200/75">
          Thank you! Our partnerships team reviews every application and will reach out at{" "}
          {f.email.trim()} if it&apos;s a fit.
        </p>
      </div>
    );
  }

  const fields: { k: keyof Fields; label: string; placeholder: string; type?: string; autoComplete?: string }[] = [
    { k: "name", label: "Full Name", placeholder: "Your name", autoComplete: "name" },
    { k: "email", label: "Email Address", placeholder: "you@example.com", type: "email", autoComplete: "email" },
    { k: "handle", label: "Instagram / YouTube Handle", placeholder: "@yourhandle" },
    { k: "audienceSize", label: "Audience Size", placeholder: "e.g. 25,000" },
  ];
  const input = (k: keyof Fields) =>
    cn(
      "w-full rounded-sm border bg-plum-900/60 px-3.5 py-2.5 text-sm text-cream-100 placeholder:text-cream-200/35 focus:outline-none",
      err(k) ? "border-blush-200" : "border-gold-500/35 focus:border-gold-400",
    );

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {fields.map(({ k, label, placeholder, type, autoComplete }) => (
        <div key={k}>
          <label htmlFor={`col-${k}`} className="label-caps mb-1.5 block text-[0.6rem] text-gold-400">
            {label}
          </label>
          <input
            id={`col-${k}`}
            type={type ?? "text"}
            value={f[k]}
            onChange={set(k)}
            autoComplete={autoComplete}
            placeholder={placeholder}
            aria-invalid={!!err(k)}
            className={input(k)}
          />
          {err(k) && <p className="mt-1 text-[0.68rem] text-blush-200">{err(k)}</p>}
        </div>
      ))}
      <div>
        <label htmlFor="col-about" className="label-caps mb-1.5 block text-[0.6rem] text-gold-400">
          Tell us about yourself
        </label>
        <textarea
          id="col-about"
          rows={4}
          value={f.about}
          onChange={set("about")}
          maxLength={5000}
          placeholder="What do you create, and why Velastia?"
          aria-invalid={!!err("about")}
          className={input("about")}
        />
        {err("about") && <p className="mt-1 text-[0.68rem] text-blush-200">{err("about")}</p>}
      </div>
      <Button type="submit" variant="gold" size="lg" className="w-full" disabled={sending}>
        {sending ? "Sending…" : "Apply for Collab"}
      </Button>
      {error && (
        <p role="alert" className="text-[0.75rem] text-blush-200">
          {error}
        </p>
      )}
    </form>
  );
}
