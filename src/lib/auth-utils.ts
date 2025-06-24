import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";

// Use a consistent secret for JWT authentication
// Priority: AUTH_SECRET > NEXTAUTH_SECRET > fallback
const JWT_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'cryptobonuses-jwt-secret-2024';

// NextAuth secret for session handling
export const NEXTAUTH_SECRET = JWT_SECRET;

// Export the JWT secret for use in other files
export { JWT_SECRET };

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

// Helper function to get the JWT secret
export function getJWTSecret(): string {
  return JWT_SECRET;
} 