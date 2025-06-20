import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  /* config options here */

    serverExternalPackages: ['swisseph'],


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
