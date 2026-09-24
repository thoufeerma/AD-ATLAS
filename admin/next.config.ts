import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://localhost:4000";
const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL ?? "http://localhost:3000";
const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/+$/, "");
const isDev = process.env.NODE_ENV !== "production";

/**
 * What the panel is allowed to load, and from where. Product and banner
 * photos can come from the storefront or the Supabase bucket; everything
 * else is this app's own. The Email Log renders each email inside a
 * sandboxed frame, which needs `frame-src 'self'` to be drawn at all.
 *
 * Inline scripts are allowed because a nonce would force every page to be
 * rendered per request; the value here is that an injected `<script src>`
 * has nowhere to load from, and no other site can frame the panel.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${STORE_URL}${SUPABASE_URL ? ` ${SUPABASE_URL}` : ""}`,
  "font-src 'self' data:",
  "frame-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,

  // This app lives inside the storefront's folder, so both lockfiles are
  // visible. Pin the root to the admin app so Turbopack resolves against
  // admin/node_modules and never reaches into the store.
  turbopack: {
    root: __dirname,
  },

  // /api/v1/* is forwarded to the backend by proxy.ts (see there for why).
  // Images uploaded to the API's own disk — local development — load through
  // here; online they come straight from Supabase Storage.
  async rewrites() {
    return [{ source: "/uploads/:path*", destination: `${API_URL}/uploads/:path*` }];
  },

  // Everything except the API pass-through, which sends its own headers.
  async headers() {
    return [
      {
        source: "/((?!api/v1).*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
