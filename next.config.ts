import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};
module.exports = {
  output: 'standalone', // For Docker optimization
  experimental: {
    serverComponentsExternalPackages: ['@turf/turf', 'leaflet'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['open-meteo.com'], // Add any image domains you use
  }
};
export default nextConfig;
