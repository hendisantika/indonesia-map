import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployments
  output: 'standalone',

  // Disable strict mode if needed for Leaflet
  reactStrictMode: true,

  // Skip build-time rendering (needed for Leaflet which requires browser environment)
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
