import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */

  serverExternalPackages: ['swisseph'],
  eslint: {
    ignoreDuringBuilds: true, // ⬅️  disables ESLint during `next build`
  },

  // PostHog rewrites
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,

  webpack: (config, { isServer }) => {
    config.externals.push({ swisseph: 'commonjs swisseph' });

    // prevent Webpack from trying to parse *.node binaries
    config.module.rules.push({
      test: /swisseph[\\/].+\.node$/,
      loader: 'node-loader',
    });

    return config;
  },
};

export default nextConfig;
