import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://localhost:4000";
// Online, images uploaded in the admin live in a public Supabase Storage
// bucket; next/image may only optimise images from that one project.
const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  // /api/v1/* is forwarded to the API by proxy.ts (it also passes on the
  // visitor's IP address). Uploaded images stored on the API's own disk —
  // local development — are forwarded here.
  async rewrites() {
    return [{ source: "/uploads/:path*", destination: `${API_URL}/uploads/:path*` }];
  },
  images: SUPABASE_URL
    ? { remotePatterns: [new URL(`${SUPABASE_URL}/storage/v1/object/public/**`)] }
    : undefined,
};

export default nextConfig;
