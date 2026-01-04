import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React 19 features
  reactStrictMode: true,

  // Turbopack is now stable in Next.js 16
  // No need to configure, it's the default

  // Internationalization for Thai language support
  i18n: {
    locales: ['th', 'en'],
    defaultLocale: 'th',
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.pwa.co.th',
      },
    ],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },

  // Experimental features
  experimental: {
    // Enable Partial Pre-Rendering
    ppr: true,
  },
};

export default nextConfig;
