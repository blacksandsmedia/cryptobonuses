/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: false,
    domains: ['cdn.prod.website-files.com', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  trailingSlash: false,
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
    largePageDataBytes: 5 * 1024 * 1024, // 5MB
    scrollRestoration: false,
  },
  typescript: {
    // !! WARN !!
    // Temporarily ignore TypeScript errors
    // Remove this when Prisma Client is properly regenerated
    ignoreBuildErrors: true,
  },
  // Disable React strict mode to avoid double renders in development
  // This helps react-beautiful-dnd work properly in development
  reactStrictMode: false,

  // Configure headers for better caching
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
