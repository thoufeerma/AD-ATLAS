"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, Leaf, FlaskConical, Heart, Award, Gift, Cake, Headphones } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const PERKS = [
  { Icon: Award, title: "Exclusive Offers", note: "Early access to sales & special deals" },
  { Icon: Gift, title: "Reward Points", note: "Earn points on every purchase" },
  { Icon: Cake, title: "Birthday Treats", note: "Special gifts on your birthday" },
  { Icon: Headphones, title: "Priority Support", note: "Faster assistance whenever you need" },
];

const BADGES = [
  { Icon: Leaf, title: "Clean Beauty", note: "Safe & Effective" },
  { Icon: FlaskConical, title: "Science Backed", note: "Dermatologically Tested" },
  { Icon: Heart, title: "Loved by Thousands", note: "10,000+ Happy Customers" },
];

export default function AuthPanel() {
  const [tab, setTab] = useState<"login" | "register">("login");

  return (
    <>
      <div className="grid lg:grid-cols-[minmax(0,38%)_minmax(0,62%)]">
        {/* Brand panel */}
        <aside className="relative overflow-hidden bg-plum-900 px-8 py-14 text-center lg:px-10">
          <h1 className="font-display text-[2.1rem] leading-tight text-cream-50">
            Welcome to Velastia
          </h1>
          <p className="mt-1.5 font-script text-2xl text-gold-400">
            Where Beauty Meets Confidence
          </p>
          <p className="mx-auto mt-5 max-w-xs text-sm leading-relaxed text-cream-200/70">
            Join thousands of beauty lovers who trust Velastia for luxury, quality
            &amp; self-expression.
          </p>

          <ul className="mx-auto mt-9 flex max-w-sm justify-center gap-7">
            {BADGES.map(({ Icon, title, note }) => (
              <li key={title} className="flex flex-1 flex-col items-center gap-2 text-center">
                <span className="grid size-11 place-items-center rounded-full border border-gold-400/60">
                  <Icon className="size-[18px] text-gold-300" />
                </span>
                <span className="text-[0.62rem] leading-tight">
                  <span className="block text-cream-100">{title}</span>
                  <span className="text-cream-200/55">{note}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="relative mx-auto mt-10 aspect-4/3 w-full max-w-sm overflow-hidden rounded-[var(--radius-card)]">
            <Image
              src="/brand/auth-products.png"
              alt="Velastia lipstick, face serum and day cream on velvet"
              fill
              sizes="(min-width: 1024px) 34vw, 92vw"
              className="object-cover"
            />
          </div>
        </aside>

        {/* Forms */}
        <div className="bg-cream-50 px-6 py-12 sm:px-10">
          <div className="mx-auto max-w-3xl">
            {/* Tabs */}
            <div className="mx-auto flex max-w-xs border-b border-gold-200">
              {(["login", "register"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "label-caps relative flex-1 pb-3 text-[0.7rem] transition-colors",
                    tab === t ? "text-plum-800" : "text-ink-soft hover:text-plum-800",
                  )}
                >
                  {t === "login" ? "Login" : "Register"}
                  {tab === t && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-plum-800" />}
                </button>
              ))}
            </div>

            {/* Both forms sit side by side on large screens, exactly as drawn;
                below that the tab above picks which one is shown. */}
            <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-8">
              <LoginForm className={cn(tab === "login" ? "block" : "hidden", "lg:block")} />

              <div className="hidden flex-col items-center lg:flex">
                <span className="w-px flex-1 bg-gold-200" />
                <span className="my-3 grid size-9 place-items-center rounded-full border border-gold-200 bg-cream-100 text-[0.6rem] text-ink-soft">
                  OR
                </span>
                <span className="w-px flex-1 bg-gold-200" />
              </div>

              <RegisterForm className={cn(tab === "register" ? "block" : "hidden", "lg:block")} />
            </div>
          </div>
        </div>
      </div>

      {/* Perks */}
      <section className="border-y border-gold-200/60 bg-cream-100">
        <div className="container-vel grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {PERKS.map(({ Icon, title, note }) => (
            <div key={title} className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full border border-gold-300/70">
                <Icon className="size-4 text-gold-600" />
              </span>
              <span className="text-[0.68rem] leading-tight">
                <span className="block font-medium text-plum-800">{title}</span>
                <span className="text-ink-soft">{note}</span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function LoginForm({ className }: { className?: string }) {
  const [show, setShow] = useState(false);

  return (
    <form className={className} onSubmit={(e) => e.preventDefault()}>
      <h2 className="flex items-center gap-2 font-display text-2xl text-plum-800">
        Welcome Back <span className="text-gold-500">♥</span>
      </h2>
      <p className="mt-1 text-[0.75rem] text-ink-soft">
        Login to continue your Velastia journey
      </p>

      <div className="mt-6 space-y-4">
        <Field id="login-email" label="Email Address" Icon={Mail} type="email" placeholder="Enter your email address" />
        <Field
          id="login-password"
          label="Password"
          Icon={Lock}
          type={show ? "text" : "password"}
          placeholder="Enter your password"
          trailing={
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              className="text-ink-soft hover:text-plum-800"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
        />
      </div>

      <div className="mt-2 text-right">
        <Link href="/contact" className="text-[0.7rem] text-plum-600 hover:text-gold-600">
          Forgot Password?
        </Link>
      </div>

      <Button type="submit" size="lg" className="mt-5 w-full">
        Login
      </Button>

      <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-[0.72rem] text-ink-soft">
        <input type="checkbox" defaultChecked className="size-3.5 accent-plum-800" />
        Keep me signed in
      </label>

      <SocialAuth />

      <p className="mt-5 text-[0.68rem] leading-relaxed text-ink-soft">
        By logging in, you agree to our{" "}
        <Link href="/terms" className="text-plum-600 hover:text-gold-600">
          Terms &amp; Conditions
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-plum-600 hover:text-gold-600">
          Privacy Policy
        </Link>
      </p>
    </form>
  );
}

function RegisterForm({ className }: { className?: string }) {
  return (
    <form className={className} onSubmit={(e) => e.preventDefault()}>
      <h2 className="flex items-center gap-2 font-display text-2xl text-plum-800">
        Create Account <span className="text-gold-500">♥</span>
      </h2>
      <p className="mt-1 text-[0.75rem] text-ink-soft">
        Join Velastia &amp; unlock exclusive benefits
      </p>

      <div className="mt-6 space-y-4">
        <Field id="reg-name" label="Full Name" Icon={User} placeholder="Enter your full name" />
        <Field id="reg-email" label="Email Address" Icon={Mail} type="email" placeholder="Enter your email address" />
        <Field id="reg-password" label="Password" Icon={Lock} type="password" placeholder="Create a password" />
        <Field id="reg-confirm" label="Confirm Password" Icon={Lock} type="password" placeholder="Confirm your password" />
      </div>

      <Button type="submit" size="lg" className="mt-6 w-full">
        Register
      </Button>

      <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-[0.72rem] leading-relaxed text-ink-soft">
        <input type="checkbox" className="mt-0.5 size-3.5 shrink-0 accent-plum-800" />
        <span>
          I agree to the{" "}
          <Link href="/terms" className="text-plum-600 hover:text-gold-600">
            Terms &amp; Conditions
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-plum-600 hover:text-gold-600">
            Privacy Policy
          </Link>
        </span>
      </label>

      <SocialAuth />
    </form>
  );
}

function SocialAuth() {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-gold-200" />
        <span className="text-[0.68rem] text-ink-soft">Or continue with</span>
        <span className="h-px flex-1 bg-gold-200" />
      </div>
      <div className="mt-4 space-y-3">
        {["Google", "Apple"].map((p) => (
          <button
            key={p}
            type="button"
            className="flex w-full items-center justify-center gap-2.5 rounded-sm border border-gold-200 bg-cream-100 py-2.5 text-sm text-plum-800 transition-colors hover:border-gold-500"
          >
            <span className="grid size-4 place-items-center text-xs font-semibold text-gold-600">
              {p[0]}
            </span>
            Continue with {p}
          </button>
        ))}
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  Icon,
  type = "text",
  placeholder,
  trailing,
}: {
  id: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  type?: string;
  placeholder?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[0.72rem] font-medium text-plum-800">
        {label}
      </label>
      <div className="flex items-center gap-2.5 rounded-sm border border-gold-200 bg-cream-100 px-3.5 focus-within:border-gold-500">
        <Icon className="size-4 shrink-0 text-ink-soft" />
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          className="w-full bg-transparent py-2.5 text-sm text-plum-800 placeholder:text-ink-soft/55 focus:outline-none"
        />
        {trailing}
      </div>
    </div>
  );
}
