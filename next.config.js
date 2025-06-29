/** @type {import('next').NextConfig} */

// Import redirects from generated configuration
let redirectsConfig = { redirects: [] };
try {
  redirectsConfig = require('./redirects.config.js');
} catch (error) {
  console.warn('No redirects.config.js found, using empty redirects array');
}

const nextConfig = {
  images: {
    unoptimized: true,
    domains: ['cdn.prod.website-files.com', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  trailingSlash: true, // Enable trailing slash to prevent 308 redirects that interfere with casino redirects
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
    largePageDataBytes: 5 * 1024 * 1024, // 5MB
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
  
  // Serve uploaded files from Railway volume
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ];
  },

  // 301 redirects from database (dynamically generated)
  async redirects() {
    console.log(`Loading ${redirectsConfig.redirects.length} redirects from database`);
    return redirectsConfig.redirects;
  },
};

module.exports = nextConfig;
