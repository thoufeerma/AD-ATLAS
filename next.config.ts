import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  // Browser-side calls (cart pricing, checkout, forms, order tracking) go to
  // this site's own /api/v1, which is forwarded to the Velastia API. Same
  // origin for the shopper, so the API needs no CORS entry for the store.
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${API_URL}/api/v1/:path*` }];
  },
};

export default nextConfig;
