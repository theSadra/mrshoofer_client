/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  // External packages
  serverExternalPackages: ['@prisma/client'],
  
  // Environment variables for build optimization
  env: {
    SKIP_ENV_VALIDATION: '1',
    NEXT_TELEMETRY_DISABLED: '1'
  },
  
  // Ultra-aggressive optimization
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client')
    }
    
    // Disable source maps entirely
    config.devtool = false
    
    return config
  },
  
  // Skip all checks for faster builds
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable everything unnecessary
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  generateEtags: false,
  
  // Fix images with custom loader
  images: {
    unoptimized: true,
    loader: 'custom',
    loaderFile: './config/image-loader.js'
  },
  
  // Minimize experimental features
  experimental: {},
  
  // Compress responses
  compress: true,
  
  // Minimize redirects
  trailingSlash: false
};

module.exports = nextConfig;
