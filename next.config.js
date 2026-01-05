/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  // External packages
  serverExternalPackages: ['@prisma/client'],
  
  // Environment variables for build optimization
  env: {
    SKIP_ENV_VALIDATION: '1',
    NEXT_TELEMETRY_DISABLED: '1',
    // Hardcoded critical environment variables
    NEXTAUTH_SECRET: 'vK8mN2pQ7rS9tU6wX3yZ5aB8cE1fH4iL7oP0qR3sT6uV9xA2bD5gJ8kM1nQ4rU7w',
    NEXTAUTH_URL: 'https://mrshoofer-client.liara.run',
    ORS_API_SECRET: 'YJure760oRHOgR0YAGOOGO1233211yMMB9R0my7cLtNOlscPgMLazgZCQhVy6',
    SMSIR_API_KEY: 'YJure760oRHOgR01yMMB9R0my7cLtNOlscPgMLazgZCQhVy6',
    NEXT_PUBLIC_EXPOSE_FULL_ERRORS: 'true'
  },
  
  // Ultra-aggressive optimization
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client')
    }
    
    // Keep source maps for debugging production issues
    // devtool false can break minified function references
    
    return config
  },
  
  // Skip all checks for faster builds
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Enable source maps to debug production errors
  productionBrowserSourceMaps: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // Fix images with unoptimized setting
  images: {
    unoptimized: true,
  },
  
  // Headers configuration - ensure Partner API routes are never blocked
  async headers() {
    return [
      {
        source: '/api/partner/:path*',
        headers: [
          { key: 'X-Partner-Public-Route', value: 'true' },
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        ],
      },
    ];
  },
  
  // Minimize experimental features
  experimental: {},
  
  // Compress responses
  compress: true,
  
  // Minimize redirects
  trailingSlash: false
};

module.exports = nextConfig;
