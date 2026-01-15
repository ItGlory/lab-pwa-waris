import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React 19 features
  reactStrictMode: true,

  // Turbopack is now stable in Next.js 16
  // No need to configure, it's the default

  // Note: i18n is handled via next-intl in App Router
  // The Pages Router i18n config is not supported in App Router

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

  // Proxy API requests to FastAPI backend
  async rewrites() {
    const apiUrl = process.env.API_URL || 'http://localhost:8000';
    return [
      {
        source: '/api/health',
        destination: `${apiUrl}/health`,
      },
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
