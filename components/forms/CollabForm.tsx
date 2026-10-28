"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Lock, LogIn, User } from "lucide-react";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api/client";
import { useAccount } from "@/lib/account";
import { cn } from "@/lib/utils";

type Fields = { name: string; email: string; handle: string; audienceSize: string; about: string };

/** "@velastiaofficial", "velastiaofficial" or a link to the profile. */
const HANDLE = /^@?[A-Za-z0-9._-]{2,30}$/;
const PROFILE_URL = /^(https?:\/\/)?(www\.)?(instagram\.com|youtube\.com|youtu\.be)\/[A-Za-z0-9@._\-/]+$/i;

export function handleProblem(raw: string) {
  const handle = raw.trim();
  // Applications are reviewed on the creator's profile, so this one can't be skipped.
  if (!handle) return "Enter your Instagram or YouTube handle.";
  if (!HANDLE.test(handle) && !PROFILE_URL.test(handle)) {
    return "Use your handle (e.g. @velastiaofficial) or a link to your profile.";
  }
  return null;
}

function validate(f: Fields) {
  const errors: Partial<Record<keyof Fields, string>> = {};
  if (f.name.trim().length < 2) errors.name = "Enter your name.";
  const handle = handleProblem(f.handle);
  if (handle) errors.handle = handle;
  if (f.audienceSize.trim().length > 40) errors.audienceSize = "Keep this short, e.g. 25,000.";
  if (f.about.trim().length < 10) errors.about = "Tell us a little more — at least 10 characters.";
  return errors;
}

/**
 * Applications land in the admin's Collab Applications list. `applyingAs`
 * (e.g. "Makeup Artist", from the Collabs page cards) is noted at the top of
 * the message.
 *
 * Applicants must be signed in to verify their identity and prevent email spoofing.
 */
export default function CollabForm({ applyingAs }: { applyingAs?: string } = {}) {
  const { status, me } = useAccount();

  const [f, setF] = useState<Fields>({
    name: "",
    email: "",
    handle: "",
    audienceSize: "",
    about: "",
  });
  const [showErrors, setShowErrors] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  // Populate from logged-in customer profile
  useEffect(() => {
    if (me) {
      setF((prev) => ({
        ...prev,
        name: prev.name || me.name || "",
        email: me.email,
      }));
    }
  }, [me]);

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
        email: me?.email ?? f.email.trim(),
        handle: f.handle.trim(),
        audienceSize: f.audienceSize.trim() || null,
        about: applyingAs ? `Applying as: ${applyingAs}\n\n${f.about.trim()}` : f.about.trim(),
      });
      setDone(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  }

  // 1. Loading state
  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Loader2 className="size-6 animate-spin text-gold-400" />
        <p className="mt-3 text-xs text-cream-200/70">Checking account status…</p>
      </div>
    );
  }

  // 2. Guest state: Must log in first
  if (status === "guest" || !me) {
    return (
      <div className="flex flex-col items-center justify-center rounded-sm border border-gold-500/30 bg-plum-900/60 p-6 text-center">
        <div className="grid size-12 place-items-center rounded-full bg-gold-500/10 text-gold-400 mb-3">
          <Lock className="size-5" />
        </div>
        <h3 className="font-heading text-xl font-bold text-cream-50">Sign In to Apply</h3>
        <p className="mt-2 max-w-sm text-xs leading-relaxed text-cream-200/80">
          To protect creator identity and ensure your referral code and commission payouts are securely linked to you, please sign in or create an account before applying.
        </p>
        <div className="mt-6 flex flex-col gap-2.5 w-full max-w-xs">
          <Link
            href="/login?next=/collabs?apply=1"
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-gold-400 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-plum-950 hover:bg-gold-300 transition-colors"
          >
            <LogIn className="size-3.5" />
            Sign In or Register
          </Link>
        </div>
      </div>
    );
  }

  // 3. Success state
  if (done) {
    return (
      <div role="status" className="flex flex-col items-center justify-center text-center py-6">
        <CheckCircle2 className="size-12 text-gold-400" strokeWidth={1.4} />
        <h3 className="mt-4 font-heading text-2xl font-bold text-cream-50">Application received</h3>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-cream-200/75">
          Thank you! Our partnerships team reviews every application and will notify you at{" "}
          <strong className="text-cream-50">{me.email}</strong> when approved.
        </p>
      </div>
    );
  }

  // 4. Application Form
  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {/* Verified Account Banner */}
      <div className="flex items-center justify-between rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-xs text-cream-100">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
          <span>
            Applying as <strong className="text-white">{me.name}</strong> ({me.email})
          </span>
        </div>
        <span className="text-[0.65rem] font-semibold text-emerald-400 font-mono tracking-wider uppercase">
          Verified
        </span>
      </div>

      {/* Name */}
      <div>
        <label htmlFor="col-name" className="label-caps mb-1.5 block text-[0.6rem] text-gold-400">
          Full Name / Creator Name <span aria-hidden className="ml-0.5 text-blush-200">*</span>
        </label>
        <input
          id="col-name"
          type="text"
          value={f.name}
          onChange={set("name")}
          autoComplete="name"
          placeholder="Your name or stage name"
          required
          aria-invalid={!!err("name")}
          className={cn(
            "w-full rounded-sm border bg-plum-900/60 px-3.5 py-2.5 text-sm text-cream-100 placeholder:text-cream-200/35 focus:outline-none",
            err("name") ? "border-blush-200" : "border-gold-500/35 focus:border-gold-400",
          )}
        />
        {err("name") && <p className="mt-1 text-[0.68rem] text-blush-200">{err("name")}</p>}
      </div>

      {/* Social Handle */}
      <div>
        <label htmlFor="col-handle" className="label-caps mb-1.5 block text-[0.6rem] text-gold-400">
          Instagram / YouTube Handle <span aria-hidden className="ml-0.5 text-blush-200">*</span>
        </label>
        <input
          id="col-handle"
          type="text"
          value={f.handle}
          onChange={set("handle")}
          placeholder="@yourhandle or profile URL"
          required
          aria-invalid={!!err("handle")}
          className={cn(
            "w-full rounded-sm border bg-plum-900/60 px-3.5 py-2.5 text-sm text-cream-100 placeholder:text-cream-200/35 focus:outline-none",
            err("handle") ? "border-blush-200" : "border-gold-500/35 focus:border-gold-400",
          )}
        />
        {err("handle") && <p className="mt-1 text-[0.68rem] text-blush-200">{err("handle")}</p>}
      </div>

      {/* Audience Size */}
      <div>
        <label htmlFor="col-audience" className="label-caps mb-1.5 block text-[0.6rem] text-gold-400">
          Audience Size <span className="ml-1 normal-case tracking-normal text-cream-200/45">(optional)</span>
        </label>
        <input
          id="col-audience"
          type="text"
          value={f.audienceSize}
          onChange={set("audienceSize")}
          placeholder="e.g. 25,000 followers / subscribers"
          className="w-full rounded-sm border border-gold-500/35 bg-plum-900/60 px-3.5 py-2.5 text-sm text-cream-100 placeholder:text-cream-200/35 focus:border-gold-400 focus:outline-none"
        />
        {err("audienceSize") && <p className="mt-1 text-[0.68rem] text-blush-200">{err("audienceSize")}</p>}
      </div>

      {/* About */}
      <div>
        <label htmlFor="col-about" className="label-caps mb-1.5 block text-[0.6rem] text-gold-400">
          Tell us about yourself <span aria-hidden className="ml-0.5 text-blush-200">*</span>
        </label>
        <textarea
          id="col-about"
          rows={4}
          value={f.about}
          onChange={set("about")}
          required
          maxLength={5000}
          placeholder="What beauty content do you create, and why do you want to partner with Velastia?"
          aria-invalid={!!err("about")}
          className={cn(
            "w-full rounded-sm border bg-plum-900/60 px-3.5 py-2.5 text-sm text-cream-100 placeholder:text-cream-200/35 focus:outline-none",
            err("about") ? "border-blush-200" : "border-gold-500/35 focus:border-gold-400",
          )}
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
