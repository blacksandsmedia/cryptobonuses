import { PrismaClient } from "@prisma/client";

// Add prisma to the NodeJS global type
declare global {
  var prisma: PrismaClient | undefined;
}

// Create Prisma client with build-time error handling
function createPrismaClient() {
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'error', 'warn'] 
        : ['error'],
      // Don't try to connect during build if using dummy URL
      datasources: process.env.DATABASE_URL?.includes('dummy') ? undefined : {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
  } catch (error) {
    console.warn('Prisma Client initialization failed during build:', error);
    // Return a mock client that throws helpful errors
    return new Proxy({} as PrismaClient, {
      get() {
        throw new Error('Database not available during build process');
      }
    });
  }
}

// Prevent multiple instances of Prisma Client in development
export const prisma = global.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma; 