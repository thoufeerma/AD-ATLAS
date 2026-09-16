import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This app lives inside the storefront's folder, so both lockfiles are
  // visible. Pin the root to the admin app so Turbopack resolves against
  // admin/node_modules and never reaches into the store.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
