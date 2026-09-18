"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api/client";
import { cn, looksLikeEmail } from "@/lib/utils";

const SUBJECTS = [
  "Order enquiry",
  "Returns & refunds",
  "Product question",
  "Collaboration",
  "Something else",
];

type Fields = { name: string; email: string; phone: string; subject: string; message: string };

function validate(f: Fields) {
  const errors: Partial<Record<keyof Fields, string>> = {};
  if (f.name.trim().length < 2) errors.name = "Enter your name.";
  if (!looksLikeEmail(f.email)) errors.email = "Enter a valid email address.";
  if (f.phone.trim().length > 20) errors.phone = "That phone number looks too long.";
  if (f.message.trim().length < 5) errors.message = "Tell us a little more.";
  return errors;
}

/** Messages land in the admin's inbox (Contact Messages). */
export default function ContactForm() {
  const [f, setF] = useState<Fields>({
    name: "",
    email: "",
    phone: "",
    subject: SUBJECTS[0],
    message: "",
  });
  const [showErrors, setShowErrors] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const errors = validate(f);
  const err = (k: keyof Fields) => (showErrors ? errors[k] : undefined);
  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
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
      await api("POST", "/contact", {
        name: f.name.trim(),
        email: f.email.trim(),
        phone: f.phone.trim() || null,
        subject: f.subject,
        message: f.message.trim(),
      });
      setDone(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  }

  const box =
    "rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-6 sm:p-8";

  if (done) {
    return (
      <div role="status" className={cn(box, "flex flex-col items-center justify-center text-center")}>
        <CheckCircle2 className="size-12 text-success" strokeWidth={1.4} />
        <h2 className="mt-4 font-display text-xl text-plum-800">Message sent</h2>
        <p className="mt-1.5 max-w-sm text-[0.8rem] leading-relaxed text-ink-soft">
          Thank you, {f.name.trim().split(/\s+/)[0]}. We&apos;ll reply to {f.email.trim()} as soon
          as we can.
        </p>
      </div>
    );
  }

  const input = (k: keyof Fields) =>
    cn(
      "w-full rounded-sm border bg-cream-50 px-3.5 py-2.5 text-sm text-plum-800 placeholder:text-ink-soft/50 focus:outline-none",
      err(k) ? "border-danger" : "border-gold-200 focus:border-gold-500",
    );

  return (
    <form onSubmit={submit} noValidate className={box}>
      <h2 className="font-display text-xl text-plum-800">Send us a message</h2>
      <p className="mt-1 text-[0.75rem] text-ink-soft">
        Fill this in and we&apos;ll get back to you by email.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Labelled id="c-name" label="Full Name" error={err("name")}>
          <input id="c-name" value={f.name} onChange={set("name")} autoComplete="name" placeholder="Your name" className={input("name")} aria-invalid={!!err("name")} />
        </Labelled>
        <Labelled id="c-email" label="Email Address" error={err("email")}>
          <input id="c-email" type="email" value={f.email} onChange={set("email")} autoComplete="email" placeholder="you@example.com" className={input("email")} aria-invalid={!!err("email")} />
        </Labelled>
        <Labelled id="c-phone" label="Phone (optional)" error={err("phone")}>
          <input id="c-phone" type="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" placeholder="98765 43210" className={input("phone")} aria-invalid={!!err("phone")} />
        </Labelled>
        <Labelled id="c-subject" label="Subject">
          <select id="c-subject" value={f.subject} onChange={set("subject")} className={input("subject")}>
            {SUBJECTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Labelled>
        <Labelled id="c-message" label="Message" error={err("message")} className="sm:col-span-2">
          <textarea id="c-message" rows={5} value={f.message} onChange={set("message")} maxLength={5000} placeholder="Tell us how we can help…" className={input("message")} aria-invalid={!!err("message")} />
        </Labelled>
      </div>

      <Button type="submit" size="lg" className="mt-6" disabled={sending}>
        {sending ? "Sending…" : "Send Message"}
      </Button>
      {error && (
        <p role="alert" className="mt-3 text-[0.75rem] text-danger">
          {error}
        </p>
      )}
    </form>
  );
}

function Labelled({
  id,
  label,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="label-caps mb-1.5 block text-[0.6rem] text-gold-700">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-[0.68rem] text-danger">{error}</p>}
    </div>
  );
}
