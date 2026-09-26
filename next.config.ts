import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Cloudflare quick tunnel & public dev origins
  allowedDevOrigins: [
    'localhost:3000',
    '127.0.0.1:3000',
    '*.trycloudflare.com',
    'horses-quotes-phenomenon-expectations.trycloudflare.com',
  ],
};

export default nextConfig;
