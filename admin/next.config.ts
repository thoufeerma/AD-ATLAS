import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
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
};

export default nextConfig;
