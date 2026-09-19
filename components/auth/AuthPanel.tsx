"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Leaf,
  FlaskConical,
  Heart,
  Truck,
  Package,
  MapPinned,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useSettings } from "@/components/providers/SettingsProvider";
import { api, ApiError } from "@/lib/api/client";
import { safeNext, setSignedIn, useAccount, type Me } from "@/lib/account";
import { cn, looksLikeEmail } from "@/lib/utils";

/** What an account actually gives you — nothing the store doesn't do yet. */
const PERKS = [
  { Icon: Truck, title: "Faster Checkout", note: "Your details and saved addresses, filled in" },
  { Icon: Package, title: "Order History", note: "Every order in one place" },
  { Icon: MapPinned, title: "Easy Tracking", note: "Follow each order to your door" },
  { Icon: ShieldCheck, title: "Secure Account", note: "Your details stay protected" },
];

const PASSWORD_MIN = 8;

export default function AuthPanel() {
  const { copy } = useSettings();
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const status = useAccount((s) => s.status);

  const badges = [
    { Icon: Leaf, title: "Clean Beauty", note: "Safe & Effective" },
    { Icon: FlaskConical, title: "Science Backed", note: "Dermatologically Tested" },
    { Icon: Heart, title: copy.ratingHeadline, note: `${copy.happyCustomers} Happy Customers` },
  ];
  const [tab, setTab] = useState<"login" | "register">(params.get("tab") === "register" ? "register" : "login");

  // Already signed in (e.g. arrived from a bookmark): go on to the account.
  useEffect(() => {
    if (status === "signed-in") router.replace(next);
  }, [status, next, router]);

  const done = (me: Me) => {
    setSignedIn(me);
    router.replace(next);
  };

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
            Create an account to check out faster and keep every order in one place.
          </p>

          <ul className="mx-auto mt-9 flex max-w-sm justify-center gap-7">
            {badges.map(({ Icon, title, note }) => (
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
            <div className="mx-auto flex max-w-xs border-b border-gold-200 lg:hidden">
              {(["login", "register"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  aria-pressed={tab === t}
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

            {/* Both forms side by side on large screens, as drawn; below that
                the tabs choose which one is shown. */}
            <div className="mt-10 grid gap-10 lg:mt-0 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-8">
              <LoginForm className={cn(tab === "login" ? "block" : "hidden", "lg:block")} onDone={done} />

              <div className="hidden flex-col items-center lg:flex">
                <span className="w-px flex-1 bg-gold-200" />
                <span className="my-3 grid size-9 place-items-center rounded-full border border-gold-200 bg-cream-100 text-[0.6rem] text-ink-soft">
                  OR
                </span>
                <span className="w-px flex-1 bg-gold-200" />
              </div>

              <RegisterForm className={cn(tab === "register" ? "block" : "hidden", "lg:block")} onDone={done} />
            </div>
          </div>
        </div>
      </div>

      {/* What an account gives you */}
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

function LoginForm({ className, onDone }: { className?: string; onDone: (me: Me) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!looksLikeEmail(email) || !password) {
      setError("Enter your email address and password.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      onDone(await api<Me>("POST", "/account/login", { email: email.trim(), password, remember }));
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form className={className} onSubmit={submit} noValidate>
      <h2 className="flex items-center gap-2 font-display text-2xl text-plum-800">
        Welcome Back <span className="text-gold-500">♥</span>
      </h2>
      <p className="mt-1 text-[0.75rem] text-ink-soft">Sign in to see your orders and check out faster</p>

      {error && <Alert>{error}</Alert>}

      <div className="mt-6 space-y-4">
        <Field id="login-email" label="Email Address" Icon={Mail} type="email" autoComplete="email" value={email} onChange={setEmail} placeholder="Enter your email address" />
        <Field
          id="login-password"
          label="Password"
          Icon={Lock}
          type={show ? "text" : "password"}
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          trailing={<ShowToggle show={show} onToggle={() => setShow((s) => !s)} />}
        />
      </div>

      <div className="mt-2 text-right">
        <Link href="/account/forgot" className="text-[0.7rem] text-plum-600 hover:text-gold-600">
          Forgot Password?
        </Link>
      </div>

      <Button type="submit" size="lg" className="mt-5 w-full" disabled={busy}>
        {busy && <Loader2 className="size-3.5 animate-spin" />}
        {busy ? "Signing in…" : "Login"}
      </Button>

      <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-[0.72rem] text-ink-soft">
        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-3.5 accent-plum-800" />
        Keep me signed in
      </label>

      <p className="mt-5 text-[0.68rem] leading-relaxed text-ink-soft">
        By signing in, you agree to our{" "}
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

function RegisterForm({ className, onDone }: { className?: string; onDone: (me: Me) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const problems: Record<string, string> = {};
    if (name.trim().length < 2) problems.name = "Enter your full name.";
    if (!looksLikeEmail(email)) problems.email = "Enter a valid email address.";
    if (password.length < PASSWORD_MIN) problems.password = `Use at least ${PASSWORD_MIN} characters.`;
    else if (password !== confirm) problems.confirm = "The passwords don't match.";
    setFields(problems);
    if (Object.keys(problems).length) return;
    if (!agree) {
      setError("Please agree to the Terms & Conditions and Privacy Policy.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      onDone(await api<Me>("POST", "/account/register", { name: name.trim(), email: email.trim(), password, remember: true }));
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fields).length) setFields(err.fields);
      else setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form className={className} onSubmit={submit} noValidate>
      <h2 className="flex items-center gap-2 font-display text-2xl text-plum-800">
        Create Account <span className="text-gold-500">♥</span>
      </h2>
      <p className="mt-1 text-[0.75rem] text-ink-soft">It takes less than a minute</p>

      {error && <Alert>{error}</Alert>}

      <div className="mt-6 space-y-4">
        <Field id="reg-name" label="Full Name" Icon={User} autoComplete="name" value={name} onChange={setName} error={fields.name} placeholder="Enter your full name" />
        <Field id="reg-email" label="Email Address" Icon={Mail} type="email" autoComplete="email" value={email} onChange={setEmail} error={fields.email} placeholder="Enter your email address" />
        <Field
          id="reg-password"
          label="Password"
          Icon={Lock}
          type={show ? "text" : "password"}
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          error={fields.password}
          placeholder={`At least ${PASSWORD_MIN} characters`}
          trailing={<ShowToggle show={show} onToggle={() => setShow((s) => !s)} />}
        />
        <Field id="reg-confirm" label="Confirm Password" Icon={Lock} type={show ? "text" : "password"} autoComplete="new-password" value={confirm} onChange={setConfirm} error={fields.confirm} placeholder="Type it again" />
      </div>

      <label className="mt-5 flex cursor-pointer items-start gap-2.5 text-[0.72rem] leading-relaxed text-ink-soft">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 size-3.5 shrink-0 accent-plum-800" />
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

      <Button type="submit" size="lg" className="mt-5 w-full" disabled={busy}>
        {busy && <Loader2 className="size-3.5 animate-spin" />}
        {busy ? "Creating account…" : "Register"}
      </Button>

      <p className="mt-4 text-[0.68rem] leading-relaxed text-ink-soft">
        We&apos;ll email you a link to confirm your address. Once confirmed, your order history —
        including any earlier orders with this email — appears in your account.
      </p>
    </form>
  );
}

function ShowToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={show ? "Hide password" : "Show password"}
      className="text-ink-soft hover:text-plum-800"
    >
      {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
    </button>
  );
}

function Alert({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="mt-4 flex items-start gap-2 rounded-sm bg-blush-100 px-3.5 py-2.5 text-[0.75rem] text-plum-800">
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-danger" /> {children}
    </p>
  );
}

export function Field({
  id,
  label,
  Icon,
  type = "text",
  placeholder,
  trailing,
  value,
  onChange,
  error,
  autoComplete,
}: {
  id: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  type?: string;
  placeholder?: string;
  trailing?: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[0.72rem] font-medium text-plum-800">
        {label}
      </label>
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-sm border bg-cream-100 px-3.5",
          error ? "border-danger" : "border-gold-200 focus-within:border-gold-500",
        )}
      >
        <Icon className="size-4 shrink-0 text-ink-soft" />
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className="w-full bg-transparent py-2.5 text-sm text-plum-800 placeholder:text-ink-soft/55 focus:outline-none"
        />
        {trailing}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-[0.68rem] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
