import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@deck/shared', '@deck/ui'],
  
  // GUARDRAIL: Enforce code splitting
  experimental: {
    optimizePackageImports: ['@deck/shared', '@deck/ui'],
  },
  
  // Enable bundle analyzer in production
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config: any) => {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: true,
        })
      );
      return config;
    },
  }),
};

export default nextConfig;

