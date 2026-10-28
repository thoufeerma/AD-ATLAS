export const REFERRAL_COOKIE = "vel_ref";
export const REFERRAL_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

/**
 * Sets a 30-day cookie storing the validated referral code.
 */
export function setReferralCookie(code: string) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${REFERRAL_COOKIE}=${encodeURIComponent(code.trim())}; max-age=${REFERRAL_COOKIE_MAX_AGE}; path=/; SameSite=Lax${secure}`;
}

/**
 * Reads the referral code from the 30-day cookie, if present.
 */
export function getReferralCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${REFERRAL_COOKIE}=`));
  if (!match) return null;
  const val = match.split("=")[1];
  return val ? decodeURIComponent(val).trim() : null;
}
