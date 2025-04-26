const nextConfig = {
  experimental: {
    optimizePackageImports: ['lodash', '@mantine/*', 'recharts'],
  },
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
