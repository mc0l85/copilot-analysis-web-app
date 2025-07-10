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
  // Fix: allowedDevOrigins should be at top level, not under devIndicators
  // and should specify hostname without protocol
  allowedDevOrigins: ['10.211.66.119'],
  // The 'images' block should be here, at the top level
  images: { 
    unoptimized: true 
  }, 
};

module.exports = nextConfig;