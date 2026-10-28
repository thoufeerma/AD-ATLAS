"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api/client";
import { setReferralCookie } from "@/lib/referral";

type ClickResponse = {
  valid: boolean;
  code?: string;
  collaborator?: { name: string; handle: string | null };
};

export default function ReferralTracker() {
  const searchParams = useSearchParams();
  const trackedRef = useRef<string | null>(null);

  useEffect(() => {
    const rawCode = searchParams.get("ref");
    if (!rawCode) return;
    const code = rawCode.trim();
    if (!code) return;

    const normalized = code.toUpperCase();
    if (trackedRef.current === normalized) return;
    trackedRef.current = normalized;

    api<ClickResponse>("POST", "/referrals/click", { code })
      .then((res) => {
        if (res?.valid && res.code) {
          setReferralCookie(res.code);
        }
      })
      .catch(() => {
        // Silently ignore errors; invalid codes are ignored
      });
  }, [searchParams]);

  return null;
}
