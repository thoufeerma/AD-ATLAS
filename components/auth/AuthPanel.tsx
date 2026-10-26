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
  ShieldCheck,
  AlertCircle,
  Loader2,
  Search,
  ShoppingBag,
  Award,
  Gift,
  Cake,
  Headset
} from "lucide-react";
import Button from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api/client";
import { safeNext, setSignedIn, useAccount, type Me } from "@/lib/account";
import { useStore, useHydrated } from "@/lib/store";
import { cn, looksLikeEmail } from "@/lib/utils";

const PASSWORD_MIN = 8;

export default function AuthPanel() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const status = useAccount((s) => s.status);

  const hydrated = useHydrated();
  const lines = useStore((s) => s.lines);
  const wishlist = useStore((s) => s.wishlist);
  const cartCount = lines.reduce((n, l) => n + l.qty, 0);

  const leftBadges = [
    { Icon: Leaf, title: "Clean Beauty", note: "Safe & Effective" },
    { Icon: FlaskConical, title: "Science Backed", note: "Dermatologically Tested" },
    { Icon: Heart, title: "Loved by Thousands", note: `10,000+ Happy Customers` },
  ];

  const rightBadges = [
    { Icon: Award, title: "Exclusive Offers", note: "Early access to sales & special deals" },
    { Icon: Gift, title: "Reward Points", note: "Earn points on every purchase" },
    { Icon: Cake, title: "Birthday Treats", note: "Special gifts on your birthday" },
    { Icon: Headset, title: "Priority Support", note: "Faster assistance whenever you need" },
  ];

  const bottomAssurances = [
    { Icon: ShieldCheck, title: "100% AUTHENTIC PRODUCTS" },
    { Icon: FlaskConical, title: "DERMATOLOGICALLY TESTED" },
    { Icon: Lock, title: "SECURE PAYMENTS" },
    { Icon: Truck, title: "FREE SHIPPING ABOVE ₹999" },
  ];

  const [tab, setTab] = useState<"login" | "register">(params.get("tab") === "register" ? "register" : "login");

  useEffect(() => {
    if (status === "signed-in") router.replace(next);
  }, [status, next, router]);

  const done = (me: Me) => {
    setSignedIn(me);
    router.replace(next);
  };

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <div className="flex-1 grid lg:grid-cols-[minmax(0,40%)_minmax(0,60%)] xl:grid-cols-[minmax(0,35%)_minmax(0,65%)]">
        {/* Left Dark Panel */}
        <aside className="relative flex flex-col items-center justify-start overflow-hidden bg-[#20082d] px-8 pt-12 pb-8 text-center lg:px-10 h-full min-h-[600px]">
          <Image
            src="/images/login-left-banner.png"
            alt="Velastia Luxury Beauty"
            fill
            priority
            sizes="(min-width: 1280px) 35vw, (min-width: 1024px) 40vw, 100vw"
            className="object-cover object-bottom z-0"
          />
          
          <div className="relative z-10 flex flex-col items-center w-full">
            {/* Mobile Top Header on Dark Aside */}
            <div className="lg:hidden flex items-center justify-between w-full pb-6 mb-2 text-cream-50 z-20">
              <Link href="/" className="font-heading text-lg font-bold uppercase tracking-wider text-cream-50 hover:text-[#c8963c] transition-colors">
                Velastia
              </Link>
              <div className="flex items-center gap-2">
                <Link
                  href="/search"
                  aria-label="Search"
                  className="grid size-9 place-items-center text-cream-100 hover:text-[#c8963c] transition-colors"
                >
                  <Search className="size-[1.15rem]" strokeWidth={1.5} />
                </Link>
                <Link
                  href="/wishlist"
                  aria-label="Wishlist"
                  className="relative grid size-9 place-items-center text-cream-100 hover:text-[#c8963c] transition-colors"
                >
                  <Heart className="size-[1.15rem]" strokeWidth={1.5} />
                  {hydrated && wishlist.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 grid min-w-4 h-4 px-1 place-items-center rounded-full bg-[#c8963c] text-[0.55rem] font-bold text-white leading-none">
                      {wishlist.length}
                    </span>
                  )}
                </Link>
                <Link
                  href="/cart"
                  aria-label="Cart"
                  className="relative grid size-9 place-items-center text-cream-100 hover:text-[#c8963c] transition-colors"
                >
                  <ShoppingBag className="size-[1.15rem]" strokeWidth={1.5} />
                  {hydrated && cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 grid min-w-4 h-4 px-1 place-items-center rounded-full bg-[#c8963c] text-[0.55rem] font-bold text-white leading-none">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            <div className="mb-8 flex flex-col items-center">
              <Link href="/" className="transition-opacity hover:opacity-90">
                <Image
                  src="/brand/footer-logo-light.png"
                  alt="Velastia"
                  width={200}
                  height={66}
                  className="h-[4.5rem] w-auto mb-2"
                />
              </Link>
            </div>

            <h1 className="font-heading text-[2.5rem] xl:text-[2.8rem] leading-tight text-cream-50 font-bold tracking-wide">
              Welcome to Velastia
            </h1>
            <p className="mt-1 flex items-center justify-center gap-2 font-script text-[2.2rem] xl:text-[2.4rem] text-[#c8963c]">
              Where Beauty Meets Confidence <Heart className="size-6 shrink-0" strokeWidth={1.5} />
            </p>
            <p className="mx-auto mt-6 max-w-[21rem] text-[0.95rem] leading-[1.6] text-cream-50/90">
              Join thousands of beauty lovers who trust Velastia for luxury, quality &amp; self-expression.
            </p>

            <ul className="mx-auto mt-12 flex w-full max-w-[22rem] justify-between gap-4">
              {leftBadges.map(({ Icon, title, note }) => (
                <li key={title} className="flex flex-1 flex-col items-center gap-3 text-center">
                  <span className="grid size-12 place-items-center rounded-full border border-[#c8963c]/60 bg-[#20082d]/30 backdrop-blur-sm">
                    <Icon className="size-5 text-[#c8963c]" strokeWidth={1.5} />
                  </span>
                  <span className="text-[0.65rem] leading-[1.4]">
                    <span className="block text-cream-50 font-semibold">{title}</span>
                    <span className="text-cream-50/70">{note}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Right Cream Panel */}
        <div className="bg-[#fcf9f5] flex flex-col relative px-8 py-10 lg:px-12 xl:px-16">
          {/* Header Navigation */}
          <div className="flex items-center justify-between pb-8 lg:pb-12 w-full max-w-[65rem] mx-auto">
            {/* Desktop Navigation Links */}
            <ul className="hidden lg:flex items-center gap-6 xl:gap-9 text-[0.7rem] font-bold uppercase tracking-[0.05em] text-[#20082d]">
              <li><Link href="/" className="hover:text-[#c8963c] transition-colors">Home</Link></li>
              <li><Link href="/shop" className="hover:text-[#c8963c] transition-colors">Shop</Link></li>
              <li><Link href="/about" className="hover:text-[#c8963c] transition-colors">About Us</Link></li>
              <li><Link href="/ingredients" className="hover:text-[#c8963c] transition-colors">Ingredients</Link></li>
              <li><Link href="/reviews" className="hover:text-[#c8963c] transition-colors">Reviews</Link></li>
              <li><Link href="/collabs" className="hover:text-[#c8963c] transition-colors">Collabs</Link></li>
              <li><Link href="/shop?category=offers" className="hover:text-[#c8963c] transition-colors">Offers</Link></li>
            </ul>

            {/* Mobile Brand Link */}
            <div className="lg:hidden flex items-center">
              <Link href="/" className="font-heading text-lg font-bold uppercase tracking-wider text-[#20082d] hover:text-[#c8963c] transition-colors">
                Velastia
              </Link>
            </div>

            {/* Action Icons: Search, User, Wishlist, Cart */}
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-5 text-[#20082d]">
              <Link
                href="/search"
                aria-label="Search"
                className="grid size-9 place-items-center hover:text-[#c8963c] transition-colors"
              >
                <Search className="size-[1.15rem]" strokeWidth={1.5} />
              </Link>
              <Link
                href={status === "signed-in" ? "/account" : "/login"}
                aria-label={status === "signed-in" ? "Your account" : "Sign in"}
                className="grid size-9 place-items-center hover:text-[#c8963c] transition-colors"
              >
                <User className="size-[1.15rem]" strokeWidth={1.5} />
              </Link>
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="relative grid size-9 place-items-center hover:text-[#c8963c] transition-colors"
              >
                <Heart className="size-[1.15rem]" strokeWidth={1.5} />
                {hydrated && wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 grid min-w-4 h-4 px-1 place-items-center rounded-full bg-[#c8963c] text-[0.55rem] font-bold text-white leading-none shadow-xs">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              <Link
                href="/cart"
                aria-label="Cart"
                className="relative grid size-9 place-items-center hover:text-[#c8963c] transition-colors"
              >
                <ShoppingBag className="size-[1.15rem]" strokeWidth={1.5} />
                {hydrated && cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 grid min-w-4 h-4 px-1 place-items-center rounded-full bg-[#c8963c] text-[0.55rem] font-bold text-white leading-none shadow-xs">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          <div className="flex-1 w-full max-w-[65rem] mx-auto flex flex-col">
            {/* Tabs */}
            <div className="flex justify-center gap-16 lg:gap-24 border-b border-[#eaddce] pb-4 mb-12">
              <button
                type="button"
                onClick={() => setTab("login")}
                className={cn(
                  "text-[1.1rem] uppercase tracking-wide relative cursor-pointer pb-1 transition-all",
                  tab === "login"
                    ? "font-bold text-[#20082d]"
                    : "font-medium text-[#20082d]/40 hover:text-[#20082d]/70",
                )}
              >
                LOGIN
                {tab === "login" && (
                  <span className="absolute -bottom-[17px] left-0 right-0 h-[3px] bg-[#20082d]" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setTab("register")}
                className={cn(
                  "text-[1.1rem] uppercase tracking-wide relative cursor-pointer pb-1 transition-all",
                  tab === "register"
                    ? "font-bold text-[#20082d]"
                    : "font-medium text-[#20082d]/40 hover:text-[#20082d]/70",
                )}
              >
                REGISTER
                {tab === "register" && (
                  <span className="absolute -bottom-[17px] left-0 right-0 h-[3px] bg-[#20082d]" />
                )}
              </button>
            </div>

            {/* Forms Split */}
            <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-10 lg:gap-12 xl:gap-16 mb-16 items-start">
              {/* Welcome Back (Login) Section */}
              <div
                className={cn(
                  "relative transition-all duration-300",
                  tab === "login"
                    ? "filter-none opacity-100"
                    : "blur-[3.5px] opacity-35 grayscale-[20%] select-none cursor-pointer hover:opacity-50",
                )}
                onClick={() => {
                  if (tab !== "login") setTab("login");
                }}
              >
                {tab !== "login" && (
                  <div
                    className="absolute inset-0 z-30 cursor-pointer"
                    title="Click to switch to Login"
                  />
                )}
                <LoginForm onDone={done} />
              </div>

              <div className="hidden lg:flex flex-col items-center pt-8 h-full min-h-[400px]">
                <span className="w-px flex-1 bg-[#eaddce]" />
                <span className="my-4 grid size-10 place-items-center rounded-full border border-[#eaddce] bg-white text-[0.75rem] font-bold text-[#20082d]/60">
                  OR
                </span>
                <span className="w-px flex-1 bg-[#eaddce]" />
              </div>

              {/* Create Account (Register) Section */}
              <div
                className={cn(
                  "relative transition-all duration-300",
                  tab === "register"
                    ? "filter-none opacity-100"
                    : "blur-[3.5px] opacity-35 grayscale-[20%] select-none cursor-pointer hover:opacity-50",
                )}
                onClick={() => {
                  if (tab !== "register") setTab("register");
                }}
              >
                {tab !== "register" && (
                  <div
                    className="absolute inset-0 z-30 cursor-pointer"
                    title="Click to switch to Register"
                  />
                )}
                <RegisterForm onDone={done} />
              </div>
            </div>

            {/* Right Panel Bottom Badges */}
            <div className="mt-auto grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 xl:gap-6 pt-8 border-t border-[#eaddce]">
              {rightBadges.map(({ Icon, title, note }) => (
                <div key={title} className="flex items-center gap-3.5">
                  <span className="grid size-12 xl:size-13 shrink-0 place-items-center rounded-full border border-[#eaddce] bg-white/70 shadow-xs">
                    <Icon className="size-5 xl:size-5.5 text-[#c8963c]" strokeWidth={1.6} />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[0.85rem] xl:text-[0.9rem] font-bold text-[#20082d] leading-snug">
                      {title}
                    </span>
                    <span className="text-[0.74rem] xl:text-[0.78rem] text-[#20082d]/75 leading-snug mt-0.5">
                      {note}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Global Bottom Assurances */}
      <div className="bg-[#20082d] w-full py-5 border-t border-white/10">
        <ul className="container-vel mx-auto flex flex-wrap justify-center lg:justify-between items-center gap-6">
          {bottomAssurances.map(({ Icon, title }) => (
            <li key={title} className="flex items-center gap-2 text-cream-50 text-[0.7rem] tracking-wider font-semibold">
              <Icon className="size-4 text-[#c8963c]" strokeWidth={1.5} /> {title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SocialLogins() {
  return (
    <>
      <div className="mt-8 flex items-center">
        <span className="h-px flex-1 bg-[#eaddce]" />
        <span className="px-4 text-[0.75rem] text-[#20082d]/60 font-medium">Or continue with</span>
        <span className="h-px flex-1 bg-[#eaddce]" />
      </div>
      <div className="mt-6 space-y-3.5">
        <button type="button" className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#eaddce] bg-white py-3 text-[0.85rem] font-bold text-[#20082d] shadow-sm hover:bg-[#fcf9f5] transition-colors">
          <svg viewBox="0 0 24 24" className="size-4" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> Continue with Google
        </button>
        <button type="button" className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#eaddce] bg-white py-3 text-[0.85rem] font-bold text-[#20082d] shadow-sm hover:bg-[#fcf9f5] transition-colors">
          <svg viewBox="0 0 24 24" className="size-4" fill="currentColor"><path d="M17.05 20.28c-.98.68-2.05.8-3.08.8-1.09 0-2.09-.34-3.13-.34-1.02 0-2.11.34-3.17.34-1.02 0-2.11-.14-3.08-.8-2.05-1.38-4.47-5.46-4.47-8.99 0-2.73 1.63-4.8 3.8-5.32 1.04-.25 2.18.06 3.06.45 1.05.47 1.83.47 2.88 0 .86-.38 2.04-.74 3.12-.45 2.11.53 3.49 2.21 3.59 2.37-.16.1-2.12 1.25-2.12 3.69 0 2.86 2.45 3.81 2.5 3.84-.04.14-1.07 3.53-2.9 4.41M12.03 5.48C11.95 3.5 13.5 1.87 15.42 1.77c.15 2.08-1.58 3.87-3.39 3.71"/></svg> Continue with Apple
        </button>
      </div>
    </>
  )
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
      <h2 className="flex items-center gap-2 font-heading text-[2.1rem] font-bold text-[#20082d]">
        Welcome Back <Heart className="size-[1.4rem] shrink-0 text-[#c8963c]" strokeWidth={1.5} />
      </h2>
      <p className="mt-1 text-[0.8rem] text-[#20082d]/80 font-medium">Login to continue your Velastia journey</p>

      {error && <Alert>{error}</Alert>}

      <div className="mt-8 space-y-5">
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

      <div className="mt-3 text-right">
        <Link href="/account/forgot" className="text-[0.7rem] font-bold text-[#20082d] hover:text-[#c8963c] transition-colors">
          Forgot Password?
        </Link>
      </div>

      <Button type="submit" size="lg" className="mt-6 w-full bg-[#20082d] text-white hover:bg-[#371938] font-bold uppercase tracking-widest text-[0.85rem] h-12 border border-gold-400/40 shadow-[0_4px_16px_rgba(32,8,45,0.25)] hover:shadow-[0_8px_24px_rgba(32,8,45,0.38),0_2px_8px_rgba(193,136,62,0.2)] hover:border-gold-400/70 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300" disabled={busy}>
        {busy && <Loader2 className="size-3.5 animate-spin" />}
        {busy ? "Signing in…" : "LOGIN"}
      </Button>

      <label className="mt-5 flex cursor-pointer items-center gap-2.5 text-[0.75rem] font-medium text-[#20082d]">
        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-[0.9rem] rounded-[0.2rem] border-[#c8963c] text-[#20082d] focus:ring-[#20082d]" />
        Keep me signed in
      </label>

      <SocialLogins />
      
      <p className="mt-8 text-[0.7rem] font-medium text-[#20082d]/70 leading-[1.6] text-left">
        By logging in, you agree to our<br/>
        <Link href="/terms" className="text-[#20082d] hover:text-[#c8963c] font-bold">
          Terms &amp; Conditions
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-[#20082d] hover:text-[#c8963c] font-bold">
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
      <h2 className="flex items-center gap-2 font-heading text-[2.1rem] font-bold text-[#20082d]">
        Create Account <Heart className="size-[1.4rem] shrink-0 text-[#c8963c]" strokeWidth={1.5} />
      </h2>
      <p className="mt-1 text-[0.8rem] text-[#20082d]/80 font-medium">Join Velastia &amp; unlock exclusive benefits</p>

      {error && <Alert>{error}</Alert>}

      <div className="mt-8 space-y-5">
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
          placeholder="Create a password"
          trailing={<ShowToggle show={show} onToggle={() => setShow((s) => !s)} />}
        />
        <Field id="reg-confirm" label="Confirm Password" Icon={Lock} type={show ? "text" : "password"} autoComplete="new-password" value={confirm} onChange={setConfirm} error={fields.confirm} placeholder="Confirm your password" />
      </div>

      <Button type="submit" size="lg" className="mt-8 w-full bg-[#20082d] text-white hover:bg-[#371938] font-bold uppercase tracking-widest text-[0.85rem] h-12 border border-gold-400/40 shadow-[0_4px_16px_rgba(32,8,45,0.25)] hover:shadow-[0_8px_24px_rgba(32,8,45,0.38),0_2px_8px_rgba(193,136,62,0.2)] hover:border-gold-400/70 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300" disabled={busy}>
        {busy && <Loader2 className="size-3.5 animate-spin" />}
        {busy ? "Creating account…" : "REGISTER"}
      </Button>

      <label className="mt-5 flex cursor-pointer items-start gap-2.5 text-[0.75rem] font-medium leading-[1.6] text-[#20082d]">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 size-[0.9rem] shrink-0 rounded-[0.2rem] border-[#c8963c] text-[#20082d] focus:ring-[#20082d]" />
        <span>
          I agree to the{" "}
          <Link href="/terms" className="text-[#20082d] font-bold hover:text-[#c8963c]">
            Terms &amp; Conditions
          </Link>{" "}
          <br/>and{" "}
          <Link href="/privacy" className="text-[#20082d] font-bold hover:text-[#c8963c]">
            Privacy Policy
          </Link>
        </span>
      </label>

      <SocialLogins />
    </form>
  );
}

function ShowToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={show ? "Hide password" : "Show password"}
      className="text-[#20082d]/50 hover:text-[#20082d]"
    >
      {show ? <EyeOff className="size-[1.15rem]" strokeWidth={1.5} /> : <Eye className="size-[1.15rem]" strokeWidth={1.5} />}
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
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
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
      <label htmlFor={id} className="mb-2 block text-[0.75rem] font-bold text-[#20082d]">
        {label}
      </label>
      <div
        className={cn(
          "flex items-center gap-3 rounded-md border bg-white px-4",
          error ? "border-danger" : "border-[#eaddce] focus-within:border-[#c8963c]",
        )}
      >
        <Icon className="size-[1.15rem] shrink-0 text-[#20082d]/40" strokeWidth={1.5} />
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className="w-full bg-transparent py-3 text-[0.85rem] font-medium text-[#20082d] placeholder:text-[#20082d]/30 focus:outline-none"
        />
        {trailing}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-[0.68rem] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
