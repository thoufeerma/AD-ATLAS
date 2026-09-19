import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import type { AdminRole } from "../generated/prisma/client.js";
import { env, isProd } from "../env.js";

export const ADMIN_COOKIE = "vel_admin";
const SESSION_SECONDS = 60 * 60 * 8; // one working day
const secret = new TextEncoder().encode(env.JWT_SECRET);

/** `ver` must match the admin's current sessionVersion, or the session is dead. */
export type AdminSession = { sub: string; role: AdminRole; ver: number };

export const hashPassword = (plain: string) => bcrypt.hash(plain, 12);

export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);

/**
 * A genuine bcrypt hash of a random throwaway value, generated once at the same
 * cost factor as real passwords. It is compared against when the email is
 * unknown, so a failed login takes the same time whether or not the account
 * exists — response timing can't be used to enumerate admin emails.
 *
 * Generated rather than hardcoded: a hand-written hash with a malformed salt
 * makes bcrypt bail out early, which would silently reintroduce the timing gap.
 */
let dummyHash: Promise<string> | null = null;
export const getDummyHash = () =>
  (dummyHash ??= bcrypt.hash(crypto.randomUUID(), 12));

export async function signSession(session: AdminSession) {
  return new SignJWT({ role: session.role, ver: session.ver })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_SECONDS}s`)
    .sign(secret);
}

export async function readSession(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    if (typeof payload.sub !== "string" || typeof payload.role !== "string") return null;
    // Tokens from before session versions existed carry no `ver`; they fail
    // the version check and the admin simply signs in again.
    const ver = typeof payload.ver === "number" ? payload.ver : -1;
    return { sub: payload.sub, role: payload.role as AdminRole, ver };
  } catch {
    return null;
  }
}

/**
 * httpOnly so page scripts can never read the token; SameSite=Lax because the
 * admin (admin.velastia.com) and API (api.velastia.com) are the same site.
 */
export const sessionCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_SECONDS * 1000,
};

/* ── Password rules ───────────────────────────────────────────────────── */

export const PASSWORD_MIN = 12;

/**
 * Why a password isn't acceptable for an admin account, or null if it is.
 * Length does most of the work; the other checks catch the obvious choices.
 */
export function passwordProblem(password: string, email: string): string | null {
  if (password.length < PASSWORD_MIN) return `Use at least ${PASSWORD_MIN} characters.`;
  if (password.length > 200) return "Use at most 200 characters.";
  if (/^change-?me/i.test(password)) return "Choose your own password, not the placeholder.";
  const local = email.split("@")[0]?.toLowerCase() ?? "";
  if (local.length >= 4 && password.toLowerCase().includes(local)) {
    return "Don't include your email address in your password.";
  }
  if (new Set(password.toLowerCase()).size < 5) return "Use a less repetitive password.";
  return null;
}

/**
 * A one-time password for a new account or an admin-issued reset, e.g.
 * "k7qm-2xtd-hw9p-4nbe". Unambiguous characters only (no 0/o, 1/l/i), since
 * it's read off a screen and typed in. The holder must replace it on first
 * sign-in.
 */
export function temporaryPassword() {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const pick = () => alphabet[randomInt(alphabet.length)];
  return Array.from({ length: 4 }, () => Array.from({ length: 4 }, pick).join("")).join("-");
}

/* ── Login throttling ─────────────────────────────────────────────────── */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map<string, { count: number; resetAt: number }>();

/**
 * In-memory, per IP + email. Enough to blunt password guessing on a single
 * instance; swap for a shared store (Redis) once the API runs on several.
 */
export function registerFailedLogin(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

export function isLoginLocked(key: string) {
  const entry = attempts.get(key);
  if (!entry) return false;
  if (entry.resetAt < Date.now()) {
    attempts.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

export const clearLoginAttempts = (key: string) => attempts.delete(key);
