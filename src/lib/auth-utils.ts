import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";

// Use the same secret for both JWT authentication and NextAuth
// This ensures consistent authentication across different methods
const sharedSecret = process.env.AUTH_SECRET || "cryptobonuses-secret-key";

// JWT secret used for admin authentication
export const JWT_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'cryptobonuses-jwt-secret-2024';

// NextAuth secret for session handling
export const NEXTAUTH_SECRET = sharedSecret;

// Verify admin token from cookies
export async function verifyAdminToken() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      return null;
    }

    // Verify the token
    const decoded = verify(token, JWT_SECRET) as any;
    
    // Check if token has expired
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    // Ensure the token has the required fields
    if (!decoded.id || !decoded.email || !decoded.role) {
      return null;
    }
    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

// Helper function to ensure we have a valid JWT secret
export function getJWTSecret(): string {
  const secret = JWT_SECRET;
  
  if (!secret || secret.length < 32) {
    console.warn('JWT_SECRET is not set or too short. Using default for development.');
    return 'cryptobonuses-jwt-secret-2024-development-only';
  }
  
  return secret;
} 