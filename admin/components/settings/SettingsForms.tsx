"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Loader2, Lock } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api/client";
import type { Coupon, SiteCopy, SiteSettings, StoreDetails } from "@/lib/api/types";
import { cn, same } from "@/lib/utils";

const STORE_FIELDS: { name: keyof StoreDetails; label: string; hint?: string }[] = [
  { name: "name", label: "Store Name" },
  { name: "legalEntity", label: "Legal Entity", hint: "Shown in the footer of every policy page." },
  { name: "tagline", label: "Tagline" },
  { name: "supportEmail", label: "Support Email" },
  { name: "supportPhone", label: "Support Phone", hint: "Also used for the WhatsApp link." },
  { name: "supportHours", label: "Support Hours" },
  { name: "city", label: "City" },
];

const EMPTY_STORE: StoreDetails = {
  name: "",
  legalEntity: "",
  tagline: "",
  supportEmail: "",
  supportPhone: "",
  supportHours: "",
  city: "",
};

export default function SettingsForms({
  settings,
  coupons,
  canEditStore,
  canEditCopy,
}: {
  settings: SiteSettings;
  /** Percentage coupons, for the welcome offer picker. Empty if not allowed. */
  coupons: Coupon[];
  canEditStore: boolean;
  canEditCopy: boolean;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <StoreCard initial={settings.store ?? EMPTY_STORE} editable={canEditStore} />
      <div className="space-y-5">
        <WelcomeCard current={settings.welcomeOffer.code} coupons={coupons} editable={canEditStore} />
        <CopyCard initial={settings.copy} editable={canEditCopy} />
      </div>
    </div>
  );
}

/* ── Store details ── */

function StoreCard({ initial, editable }: { initial: StoreDetails; editable: boolean }) {
  const [values, setValues] = useState(initial);
  const save = useSave("PUT", "/admin/settings/store");
  const dirty = !same(values, initial);

  return (
    <Card title="Store Details">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.run(values);
        }}
        className="space-y-4"
        noValidate
      >
        {!editable && <ReadOnlyNote who="Super Administrators" />}
        {STORE_FIELDS.map((f) => (
          <Field
            key={f.name}
            label={f.label}
            hint={f.hint}
            value={values[f.name]}
            error={save.fields[f.name]}
            disabled={!editable}
            onChange={(v) => setValues((s) => ({ ...s, [f.name]: v }))}
          />
        ))}
        <p className="text-[0.68rem] text-muted">
          These appear in the storefront header, footer, contact page and policies.
        </p>
        {editable && <SaveRow save={save} dirty={dirty} />}
      </form>
    </Card>
  );
}

/* ── Welcome offer ── */

function WelcomeCard({
  current,
  coupons,
  editable,
}: {
  current: string | null;
  coupons: Coupon[];
  editable: boolean;
}) {
  const [code, setCode] = useState(current ?? "");
  const save = useSave("PUT", "/admin/settings/welcome-offer");
  const chosen = coupons.find((c) => c.code === code);

  return (
    <Card title="Welcome Offer">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.run({ code: code || null });
        }}
        className="space-y-4"
        noValidate
      >
        {!editable && <ReadOnlyNote who="Super Administrators" />}
        <label className="block">
          <span className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">Coupon</span>
          {editable ? (
            <select
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-lg border border-hairline bg-card px-3.5 py-2.5 text-[0.8rem] text-ink focus:border-series-1 focus:outline-none"
            >
              <option value="">None — don&apos;t advertise a welcome offer</option>
              {coupons.map((c) => (
                <option key={c.id} value={c.code}>
                  {c.code} — {c.value / 100}% off{c.firstOrderOnly ? ", first order" : ""}
                  {c.isActive ? "" : " (switched off)"}
                </option>
              ))}
            </select>
          ) : (
            <input value={current ?? "None"} disabled className={inputCls(false, true)} />
          )}
        </label>
        {chosen && !chosen.isActive && (
          <p className="flex items-center gap-1.5 text-[0.7rem] text-critical">
            <AlertCircle className="size-3.5" /> This coupon is switched off, so the store won&apos;t
            show it until you turn it on under Coupons.
          </p>
        )}
        <p className="text-[0.68rem] text-muted">
          Drives the homepage &ldquo;% OFF&rdquo; medallion, the shop offer card and the Offers
          page. They hide automatically if the coupon is switched off, expires or runs out.
        </p>
        {editable && <SaveRow save={save} dirty={code !== (current ?? "")} />}
      </form>
    </Card>
  );
}

/* ── Site copy ── */

function CopyCard({ initial, editable }: { initial: SiteCopy; editable: boolean }) {
  const [values, setValues] = useState({
    ratingHeadline: initial.ratingHeadline,
    socialProofHeadline: initial.socialProofHeadline,
    happyCustomers: initial.happyCustomers,
    whyVelastia: initial.whyVelastia.join("\n"),
  });
  const save = useSave("PUT", "/admin/settings/copy");
  const body = {
    ...values,
    whyVelastia: values.whyVelastia
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean),
  };
  const dirty = !same(body, initial);
  const set = (k: keyof typeof values) => (v: string) => setValues((s) => ({ ...s, [k]: v }));

  return (
    <Card title="Site Copy">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.run(body);
        }}
        className="space-y-4"
        noValidate
      >
        {!editable && <ReadOnlyNote who="Content Managers" />}
        <p className="rounded-lg bg-plane px-3.5 py-2.5 text-[0.7rem] leading-relaxed text-ink-2">
          Claims about the business, carried over from the designs. Keep them true — the review
          counts next to them are real.
        </p>
        <Field
          label="Rating Panel Heading"
          hint="Homepage rating panel and the login page."
          value={values.ratingHeadline}
          error={save.fields.ratingHeadline}
          disabled={!editable}
          onChange={set("ratingHeadline")}
        />
        <Field
          label="Happy Customers Figure"
          hint="e.g. 10K+ — shown on the homepage, About and login pages."
          value={values.happyCustomers}
          error={save.fields.happyCustomers}
          disabled={!editable}
          onChange={set("happyCustomers")}
        />
        <Field
          label="Cart Testimonials Heading"
          value={values.socialProofHeadline}
          error={save.fields.socialProofHeadline}
          disabled={!editable}
          onChange={set("socialProofHeadline")}
        />
        <label className="block">
          <span className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">
            &ldquo;Why Velastia?&rdquo; List
          </span>
          <textarea
            rows={4}
            value={values.whyVelastia}
            disabled={!editable}
            onChange={(e) => set("whyVelastia")(e.target.value)}
            className={inputCls(!!fieldError(save.fields, "whyVelastia"), !editable)}
          />
          <span className={cn("mt-1 block text-[0.68rem]", fieldError(save.fields, "whyVelastia") ? "text-critical" : "text-muted")}>
            {fieldError(save.fields, "whyVelastia") ?? "One point per line, up to 6. Shown beside the cart summary."}
          </span>
        </label>
        {editable && <SaveRow save={save} dirty={dirty} />}
      </form>
    </Card>
  );
}

/* ── Shared ── */

function useSave(method: "PUT", path: string) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  async function run(body: unknown) {
    setBusy(true);
    setSaved(false);
    setError(null);
    setFields({});
    try {
      await api(method, path, body);
      setSaved(true);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setFields(err.fields);
        setError(err.status === 400 && Object.keys(err.fields).length ? "Fix the highlighted fields." : err.message);
      } else {
        setError("Couldn't save. Try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  return { busy, saved, error, fields, run };
}

/** First error for a list field, whose paths look like "whyVelastia.2". */
function fieldError(fields: Record<string, string>, name: string) {
  const key = Object.keys(fields).find((k) => k === name || k.startsWith(`${name}.`));
  return key ? fields[key] : undefined;
}

function SaveRow({ save, dirty }: { save: ReturnType<typeof useSave>; dirty: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-3 pt-1">
      <Button type="submit" size="sm" disabled={save.busy || !dirty}>
        {save.busy && <Loader2 className="size-3.5 animate-spin" />}
        {save.busy ? "Saving…" : "Save"}
      </Button>
      {save.error ? (
        <span role="alert" className="flex items-center gap-1.5 text-[0.72rem] text-critical">
          <AlertCircle className="size-3.5" /> {save.error}
        </span>
      ) : save.saved && !dirty ? (
        <span role="status" className="flex items-center gap-1.5 text-[0.72rem] text-good">
          <Check className="size-3.5" /> Saved — live on the store within a minute
        </span>
      ) : null}
    </div>
  );
}

function ReadOnlyNote({ who }: { who: string }) {
  return (
    <p className="flex items-center gap-2 rounded-lg bg-plane px-3.5 py-2.5 text-[0.7rem] text-ink-2">
      <Lock className="size-3.5 shrink-0" /> Only {who} can change these.
    </p>
  );
}

const inputCls = (error: boolean, disabled: boolean) =>
  cn(
    "w-full rounded-lg border bg-card px-3.5 py-2.5 text-[0.8rem] text-ink placeholder:text-muted focus:outline-none",
    error ? "border-critical" : "border-hairline focus:border-series-1",
    disabled && "cursor-not-allowed bg-plane text-ink-2",
  );

function Field({
  label,
  hint,
  value,
  error,
  disabled,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  error?: string;
  disabled: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">{label}</span>
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls(!!error, disabled)}
      />
      {error ? (
        <span className="mt-1 block text-[0.7rem] text-critical">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-[0.68rem] text-muted">{hint}</span>
      ) : null}
    </label>
  );
}
