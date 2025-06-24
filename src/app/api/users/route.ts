import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth-utils";
import bcrypt from "bcryptjs";
import { generateUniqueUsername } from "@/lib/username-utils";

export async function GET() {
  // Use custom admin token authentication
  const adminUser = await verifyAdminToken();

  if (!adminUser || adminUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        username: true,
        role: true,
        profilePicture: true,
        createdAt: true,
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // Use custom admin token authentication
  const adminUser = await verifyAdminToken();

  if (!adminUser || adminUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { email, name, bio, username, password, role } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Generate username if not provided
    const finalUsername = username && username.trim() !== '' 
      ? username 
      : await generateUniqueUsername(name);

    // Check if username is already taken
    if (finalUsername !== username) {
      // Only check if we didn't generate it
      const existingUsername = await prisma.user.findUnique({
        where: { username: finalUsername },
      });

      if (existingUsername) {
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        bio: bio || null,
        username: finalUsername,
        password: hashedPassword,
        role: role || "USER",
      },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
} 