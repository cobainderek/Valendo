import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: process.env.ALLOWED_DEV_ORIGIN
    ? [process.env.ALLOWED_DEV_ORIGIN]
    : [],
  turbopack: {
    root: '..',
  },
};

export default nextConfig;
