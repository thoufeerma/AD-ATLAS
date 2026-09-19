"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Copy, KeyRound, Loader2, Power, ShieldCheck, UserPlus, X } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { api, ApiError } from "@/lib/api/client";
import { ROLE_LABEL, ROLE_SUMMARY, type AdminRole, type AdminUserRow } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const ROLES = Object.keys(ROLE_LABEL) as AdminRole[];

type Issued = { name: string; email: string; password: string; reason: "created" | "reset" };

export default function UsersManager({ users, meId }: { users: AdminUserRow[]; meId: string }) {
  const [adding, setAdding] = useState(false);
  const [issued, setIssued] = useState<Issued | null>(null);

  const counts = Object.fromEntries(
    ROLES.map((r) => [r, users.filter((u) => u.role === r && u.isActive).length]),
  ) as Record<AdminRole, number>;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        {issued && <IssuedPassword issued={issued} onClose={() => setIssued(null)} />}

        {adding ? (
          <AddUser
            onCancel={() => setAdding(false)}
            onCreated={(i) => {
              setAdding(false);
              setIssued(i);
            }}
          />
        ) : (
          <Button size="sm" onClick={() => setAdding(true)}>
            <UserPlus className="size-3.5" /> Add User
          </Button>
        )}

        <ul className="space-y-3">
          {users.map((u) => (
            <UserRow key={u.id} user={u} isMe={u.id === meId} onIssued={setIssued} />
          ))}
        </ul>
      </div>

      <Card title="Roles">
        <ul className="space-y-3">
          {ROLES.map((r) => (
            <li key={r} className="rounded-xl border border-hairline p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-[0.82rem] font-medium text-ink">
                  <ShieldCheck className="size-4 text-series-1" />
                  {ROLE_LABEL[r]}
                </p>
                <Badge tone="neutral" dot={false}>
                  {counts[r]} active
                </Badge>
              </div>
              <p className="mt-2 text-[0.72rem] leading-relaxed text-ink-2">{ROLE_SUMMARY[r]}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ── One account ── */

function UserRow({
  user,
  isMe,
  onIssued,
}: {
  user: AdminUserRow;
  isMe: boolean;
  onIssued: (i: Issued) => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run<T>(fn: () => Promise<T>) {
    setBusy(true);
    setError(null);
    try {
      const out = await fn();
      router.refresh();
      return out;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save");
      return null;
    } finally {
      setBusy(false);
    }
  }

  const setRole = (role: AdminRole) => {
    if (!window.confirm(`Make ${user.name} a ${ROLE_LABEL[role]}?\n\n${ROLE_SUMMARY[role]}`)) {
      router.refresh(); // put the select back
      return;
    }
    run(() => api("PATCH", `/admin/users/${user.id}`, { role }));
  };

  const toggleActive = () => {
    const msg = user.isActive
      ? `Turn off ${user.name}'s account? They're signed out at once and can't sign in until it's turned back on.`
      : `Turn ${user.name}'s account back on?`;
    if (!window.confirm(msg)) return;
    run(() => api("PATCH", `/admin/users/${user.id}`, { isActive: !user.isActive }));
  };

  const reset = async () => {
    if (!window.confirm(`Reset ${user.name}'s password? They'll be signed out and must use the new one-time password.`)) {
      return;
    }
    const out = await run(() =>
      api<{ temporaryPassword: string }>("POST", `/admin/users/${user.id}/reset-password`),
    );
    if (out) onIssued({ name: user.name, email: user.email, password: out.temporaryPassword, reason: "reset" });
  };

  const initials = user.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const lastSeen = user.lastLoginAt
    ? new Date(user.lastLoginAt).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Never signed in";
  const action =
    "inline-flex items-center gap-1.5 rounded-lg border border-hairline px-2.5 py-1.5 text-[0.72rem] font-medium text-ink-2 disabled:opacity-40";

  return (
    <li
      className={cn(
        "rounded-[var(--radius-card)] border border-hairline bg-card p-4",
        !user.isActive && "opacity-60",
      )}
    >
      <div className="flex flex-wrap items-center gap-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sidebar text-[0.65rem] font-semibold text-pill">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-[0.84rem] font-medium text-ink">
            {user.name}
            {isMe && <Badge tone="info" dot={false}>You</Badge>}
            {user.email.endsWith(".test") && <Badge tone="neutral" dot={false}>Test account</Badge>}
          </p>
          <p className="truncate text-[0.72rem] text-muted">{user.email}</p>
          <p className="mt-0.5 text-[0.68rem] text-muted">Last sign-in: {lastSeen}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor={`role-${user.id}`}>
            Role for {user.name}
          </label>
          <select
            id={`role-${user.id}`}
            value={user.role}
            disabled={isMe || busy || !user.isActive}
            title={isMe ? "You can't change your own role" : undefined}
            onChange={(e) => setRole(e.target.value as AdminRole)}
            className="rounded-lg border border-hairline bg-card px-2.5 py-1.5 text-[0.74rem] text-ink focus:border-series-1 focus:outline-none disabled:bg-plane disabled:text-ink-2"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
          {user.isActive ? (
            user.mustChangePassword ? (
              <Badge tone="warning">Must set password</Badge>
            ) : (
              <Badge tone="good">Active</Badge>
            )
          ) : (
            <Badge tone="neutral">Turned off</Badge>
          )}
        </div>
      </div>

      {!isMe && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-hairline pt-3">
          <button onClick={reset} disabled={busy || !user.isActive} className={cn(action, "hover:border-series-1 hover:text-series-1")}>
            <KeyRound className="size-3.5" /> Reset password
          </button>
          <button
            onClick={toggleActive}
            disabled={busy}
            className={cn(action, user.isActive ? "hover:border-critical hover:text-critical" : "hover:border-good hover:text-good")}
          >
            <Power className="size-3.5" /> {user.isActive ? "Turn off" : "Turn on"}
          </button>
          {busy && <Loader2 className="size-3.5 animate-spin text-muted" />}
          {error && (
            <span role="alert" className="flex items-center gap-1 text-[0.7rem] text-critical">
              <AlertCircle className="size-3.5" /> {error}
            </span>
          )}
        </div>
      )}
    </li>
  );
}

/* ── Add a user ── */

function AddUser({ onCancel, onCreated }: { onCancel: () => void; onCreated: (i: Issued) => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("CONTENT_MANAGER");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setFields({});
    try {
      const out = await api<{ user: AdminUserRow; temporaryPassword: string }>("POST", "/admin/users", {
        name,
        email,
        role,
      });
      router.refresh();
      onCreated({ name: out.user.name, email: out.user.email, password: out.temporaryPassword, reason: "created" });
    } catch (err) {
      if (err instanceof ApiError) {
        setFields(err.fields);
        setError(Object.keys(err.fields).length ? "Fix the highlighted fields." : err.message);
      } else {
        setError("Couldn't add the user. Try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  const input = (bad: boolean) =>
    cn(
      "w-full rounded-lg border bg-card px-3.5 py-2.5 text-[0.8rem] text-ink focus:outline-none",
      bad ? "border-critical" : "border-hairline focus:border-series-1",
    );

  return (
    <Card title="Add User">
      <form onSubmit={submit} noValidate className="space-y-4">
        {error && (
          <p role="alert" className="flex items-center gap-2 text-[0.76rem] text-critical">
            <AlertCircle className="size-4 shrink-0" /> {error}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className={input(!!fields.name)} />
            {fields.name && <span className="mt-1 block text-[0.7rem] text-critical">Enter their name.</span>}
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">Work email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input(!!fields.email)} />
            {fields.email && <span className="mt-1 block text-[0.7rem] text-critical">Enter a valid email address.</span>}
          </label>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">Role</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as AdminRole)}
            className="w-full rounded-lg border border-hairline bg-card px-3.5 py-2.5 text-[0.8rem] text-ink focus:border-series-1 focus:outline-none"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-[0.7rem] leading-relaxed text-ink-2">{ROLE_SUMMARY[role]}</span>
        </label>
        <p className="text-[0.7rem] text-muted">
          They get a one-time password to share with them yourself. They&apos;ll choose their own
          the first time they sign in.
        </p>
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={busy}>
            {busy && <Loader2 className="size-3.5 animate-spin" />}
            {busy ? "Adding…" : "Add User"}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

/* ── One-time password notice ── */

function IssuedPassword({ issued, onClose }: { issued: Issued; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard
      ?.writeText(issued.password)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => {});
  }

  return (
    <div role="status" className="rounded-[var(--radius-card)] border border-series-1/40 bg-series-1/5 p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.84rem] font-semibold text-ink">
          {issued.reason === "created" ? `${issued.name} has been added` : `New password for ${issued.name}`}
        </p>
        <button onClick={onClose} aria-label="Dismiss" className="text-muted hover:text-ink">
          <X className="size-4" />
        </button>
      </div>
      <p className="mt-1 text-[0.74rem] leading-relaxed text-ink-2">
        Give them this one-time password with the sign-in email <strong>{issued.email}</strong>. It&apos;s
        shown <strong>only now</strong> — copy it before closing. They must replace it when they sign in.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <code className="rounded-lg border border-hairline bg-card px-3.5 py-2 font-mono text-[0.95rem] tracking-wider text-ink">
          {issued.password}
        </code>
        <Button size="sm" variant="outline" onClick={copy}>
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <p className="mt-2 text-[0.68rem] text-muted">
        Share it privately (in person or a direct message), not in a group chat or email thread.
      </p>
    </div>
  );
}
