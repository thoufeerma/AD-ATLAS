"use client";

import { useState } from "react";
import { CheckCircle2, Send, Heart } from "lucide-react";
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

  const input = (k: keyof Fields) =>
    cn(
      "w-full rounded-md border bg-transparent px-4 py-2.5 text-[0.85rem] text-cream-50 placeholder:text-cream-50/70 focus:outline-none transition-colors shadow-sm",
      err(k) ? "border-danger" : "border-[#c8963c]/40 focus:border-[#c8963c]",
    );

  if (done) {
    return (
      <div role="status" className="flex h-full flex-col items-center justify-center text-center text-cream-50 p-8">
        <CheckCircle2 className="size-12 text-[#c8963c]" strokeWidth={1.4} />
        <h2 className="mt-4 font-display text-[1.5rem] uppercase">Message sent</h2>
        <p className="mt-1.5 text-[0.85rem] leading-relaxed text-cream-50/80">
          Thank you, {f.name.trim().split(/\s+/)[0]}. We&apos;ll reply to {f.email.trim()} as soon as we can.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col h-full text-cream-50">
      <div className="flex items-center gap-4 mb-8">
        <MailIcon />
        <h2 className="font-display text-[1.2rem] lg:text-[1.4rem] font-bold uppercase tracking-wider text-cream-50">Send us a message</h2>
      </div>

      <div className="grid gap-4 flex-1">
        <div>
          <input value={f.name} onChange={set("name")} autoComplete="name" placeholder="Your Name" className={input("name")} aria-invalid={!!err("name")} />
        </div>
        <div>
          <input type="email" value={f.email} onChange={set("email")} autoComplete="email" placeholder="Email Address" className={input("email")} aria-invalid={!!err("email")} />
        </div>
        <div>
          <input type="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" placeholder="Phone Number" className={input("phone")} aria-invalid={!!err("phone")} />
        </div>
        <div>
          <select value={f.subject} onChange={set("subject")} className={cn(input("subject"), "appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23c8963c%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.65rem] bg-[position:right_1rem_center]")}>
            {SUBJECTS.map((s) => (
              <option key={s} className="bg-[#240b25]">{s}</option>
            ))}
          </select>
        </div>
        <div>
          <textarea rows={4} value={f.message} onChange={set("message")} maxLength={5000} placeholder="How can we help you?" className={input("message")} aria-invalid={!!err("message")} />
        </div>
      </div>

      <div className="mt-6">
        <button type="submit" disabled={sending} className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#ca9d4c] to-[#a27334] px-7 py-3 text-[0.85rem] font-bold uppercase tracking-wider text-cream-50 transition-all hover:brightness-110 disabled:opacity-70 shadow-sm">
          {sending ? "Sending…" : "Send Message"}
          <Send className="size-4" strokeWidth={2} />
        </button>
        {error && (
          <p role="alert" className="mt-2 text-[0.75rem] text-red-400">
            {error}
          </p>
        )}
        <div className="mt-4 flex items-center gap-2 text-[#c8963c] text-[0.75rem]">
          <Heart className="size-3.5 fill-[#c8963c]" />
          <span>We usually respond within 24 hours</span>
        </div>
      </div>
    </form>
  );
}

function MailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#c8963c]">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
