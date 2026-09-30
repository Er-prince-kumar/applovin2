import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,

  // Tree-shake and optimize heavy component libraries for faster mobile & web loads
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Allow Cloudflare quick tunnel & public dev origins
  allowedDevOrigins: [
    'localhost:3000',
    '127.0.0.1:3000',
    '*.trycloudflare.com',
    'horses-quotes-phenomenon-expectations.trycloudflare.com',
  ],

  // Cache static assets aggressively for instant page transitions
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp|ico|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
