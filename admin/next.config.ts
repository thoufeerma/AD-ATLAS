import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  // This app lives inside the storefront's folder, so both lockfiles are
  // visible. Pin the root to the admin app so Turbopack resolves against
  // admin/node_modules and never reaches into the store.
  turbopack: {
    root: __dirname,
  },

  // The browser only ever talks to this app's own origin. `/api/v1/*` is
  // forwarded to the backend, which means the httpOnly session cookie the API
  // sets is first-party to the admin — no CORS, no third-party cookies, and
  // server components can read it to make authenticated calls.
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${API_URL}/api/v1/:path*` }];
  },
};

export default nextConfig;
