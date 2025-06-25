/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    domains: ['cryptobonuses.com', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http', 
        hostname: 'localhost',
        port: '3000',
      }
    ],
  },
  trailingSlash: false,
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Temporarily ignore TypeScript errors
    // Remove this when Prisma Client is properly regenerated
    ignoreBuildErrors: false,
  },
  // Disable React strict mode to avoid double renders in development
  // This helps react-beautiful-dnd work properly in development
  reactStrictMode: false,
  
  // Serve uploaded files from Railway volume
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ];
  },
  // Skip database validation during build if DATABASE_URL is not available
  async redirects() {
    return []
  },
  // Custom headers
  async headers() {
    return [
      {
        source: '/api/notifications/stream',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Connection',
            value: 'keep-alive',
          },
        ],
      },
    ];
  },
  // Railway build environment handling
  env: {
    SKIP_ENV_VALIDATION: process.env.SKIP_ENV_VALIDATION || '',
    DATABASE_URL: process.env.DATABASE_URL || '',
  },
};

module.exports = nextConfig;
