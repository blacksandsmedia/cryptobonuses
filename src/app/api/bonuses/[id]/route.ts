import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { JWT_SECRET } from "@/lib/auth-utils";

// Define a type for decoded JWT token
interface DecodedToken {
  id: string;
  email: string;
  role: string;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bonus = await prisma.bonus.findUnique({
      where: { id: params.id },
      include: {
        casino: true,
      },
    });

    if (!bonus) {
      return NextResponse.json({ error: "Bonus not found" }, { status: 404 });
    }

    return NextResponse.json(bonus);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch bonus" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  // First try JWT token authentication
  let isAuthorized = false;
  
  // Check JWT token in cookies
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('admin-token')?.value;
    
    if (token) {
      const decoded = verify(token, JWT_SECRET) as DecodedToken;
      if (decoded.role === "ADMIN") {
        isAuthorized = true;
      }
    }
  } catch (error) {
    console.error("JWT verification error:", error);
  }
  
  // Also try NextAuth session as fallback
  if (!isAuthorized) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role === "ADMIN") {
      isAuthorized = true;
    }
  }

  // Check for Authorization header as another fallback
  if (!isAuthorized) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = verify(token, JWT_SECRET) as DecodedToken;
        if (decoded.role === "ADMIN") {
          isAuthorized = true;
        }
      } catch (error) {
        console.error("Authorization header JWT verification error:", error);
      }
    }
  }

  // Return 401 if not authorized by any method
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const bonus = await prisma.bonus.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        code: data.code,
        types: data.types,
        value: data.value,
        casinoId: data.casinoId,
      },
    });
    return NextResponse.json(bonus);
  } catch (error) {
    console.error("Error updating bonus:", error);
    return NextResponse.json(
      { error: "Failed to update bonus" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // First try JWT token authentication
  let isAuthorized = false;
  
  // Check JWT token in cookies
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('admin-token')?.value;
    
    if (token) {
      const decoded = verify(token, JWT_SECRET) as DecodedToken;
      if (decoded.role === "ADMIN") {
        isAuthorized = true;
      }
    }
  } catch (error) {
    console.error("JWT verification error:", error);
  }
  
  // Also try NextAuth session as fallback
  if (!isAuthorized) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role === "ADMIN") {
      isAuthorized = true;
    }
  }

  // Check for Authorization header as another fallback
  if (!isAuthorized) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = verify(token, JWT_SECRET) as DecodedToken;
        if (decoded.role === "ADMIN") {
          isAuthorized = true;
        }
      } catch (error) {
        console.error("Authorization header JWT verification error:", error);
      }
    }
  }

  // Return 401 if not authorized by any method
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.bonus.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: "Bonus deleted successfully" });
  } catch (error) {
    console.error("Error deleting bonus:", error);
    return NextResponse.json(
      { error: "Failed to delete bonus" },
      { status: 500 }
    );
  }
} 