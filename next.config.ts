import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://localhost:4000";
// Online, images uploaded in the admin live in a public Supabase Storage
// bucket; next/image may only optimise images from that one project.
const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/+$/, "");
const isDev = process.env.NODE_ENV !== "production";

/**
 * What this page is allowed to load, and from where. Nothing here replaces
 * escaping — React does that — but it means an injected `<script src>` has
 * nowhere to load from, the page can't be framed by another site, and the
 * payment window is the only third party the browser will talk to.
 *
 * Inline scripts are allowed because the pages are statically rendered: Next
 * writes its own inline bootstrap into the HTML, and a nonce would force
 * every page to be built per request.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://checkout.razorpay.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob:${SUPABASE_URL ? ` ${SUPABASE_URL}` : ""}`,
  "font-src 'self' data:",
  // Razorpay Checkout opens in a frame and reports back to its own API.
  "frame-src https://api.razorpay.com https://checkout.razorpay.com",
  "connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const nextConfig: NextConfig = {
  // Nothing gains from announcing the framework.
  poweredByHeader: false,

  // /api/v1/* is forwarded to the API by proxy.ts (it also passes on the
  // visitor's IP address). Uploaded images stored on the API's own disk —
  // local development — are forwarded here.
  async rewrites() {
    return [{ source: "/uploads/:path*", destination: `${API_URL}/uploads/:path*` }];
  },

  // Everything except the API pass-through, which sends its own headers
  // (the invoice page, in particular, has a policy of its own).
  async headers() {
    return [
      {
        source: "/((?!api/v1).*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
        ],
      },
    ];
  },

  images: SUPABASE_URL
    ? { remotePatterns: [new URL(`${SUPABASE_URL}/storage/v1/object/public/**`)] }
    : undefined,
};

export default nextConfig;
