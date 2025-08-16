import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_API_URL: 'https://nutrition-tracking-backend.onrender.com',
  },
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
