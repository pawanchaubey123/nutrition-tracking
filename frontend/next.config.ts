import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Allow builds to complete even with ESLint errors during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow builds to complete even with TypeScript errors during production builds
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
