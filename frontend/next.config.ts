import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployments
  output: 'standalone',

  // Disable strict mode if needed for Leaflet
  reactStrictMode: true,
};

export default nextConfig;
