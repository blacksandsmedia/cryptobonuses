import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth-utils";
import bcrypt from "bcryptjs";
import { generateUniqueUsername } from "@/lib/username-utils";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Use custom admin token authentication
  const adminUser = await verifyAdminToken();

  if (!adminUser || adminUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Use custom admin token authentication
  const adminUser = await verifyAdminToken();

  if (!adminUser || adminUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { email, name, bio, username, password, role } = await request.json();

    // Get current user to check for changes
    const currentUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: { username: true, name: true }
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate username if not provided and user doesn't have one
    let finalUsername = username;
    if (!finalUsername || finalUsername.trim() === '') {
      if (!currentUser.username) {
        finalUsername = await generateUniqueUsername(name || currentUser.name);
      } else {
        finalUsername = currentUser.username;
      }
    }

    // Check if username is already taken by another user
    if (finalUsername !== currentUser.username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username: finalUsername },
      });

      if (existingUsername && existingUsername.id !== params.id) {
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      email,
      name: name || null,
      bio: bio || null,
      username: finalUsername,
      role,
    };

    // Only update password if provided
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Use custom admin token authentication
  const adminUser = await verifyAdminToken();

  if (!adminUser || adminUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
} 