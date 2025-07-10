const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: process.env.NEXT_OUTPUT_MODE,
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../'),
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  devIndicators: {
    allowedDevOrigins: ['http://10.211.66.119'],
  },
  // The 'images' block should be here, at the top level
  images: { 
    unoptimized: true 
  }, 
};

module.exports = nextConfig;