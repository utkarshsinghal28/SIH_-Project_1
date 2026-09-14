import type { NextConfig } from "next";

/**
 * The Next.js entry in this repository is ONLY a static preview host for the
 * React + Vite SPA that lives in `client/`. It contains no application logic:
 *  - `/api/health`  -> platform runtime health probe
 *  - `/:path*`      -> serves the built SPA shell (public/index.html)
 */
const nextConfig: NextConfig = {};

export default nextConfig;
