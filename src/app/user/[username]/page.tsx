import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import UserProfileClient from "./UserProfileClient";

interface Props {
  params: { username: string };
}

interface UserProfile {
  id: string;
  name: string | null;
  bio: string | null;
  username: string | null;
  profilePicture: string | null;
  image: string | null;
  createdAt: string;
}

async function getUser(username: string): Promise<UserProfile | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        bio: true,
        username: true,
        profilePicture: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await getUser(params.username);

  if (!user) {
    return {
      title: "User Not Found - Crypto Bonuses",
      description: "The user profile you're looking for doesn't exist.",
    };
  }

  const userName = user.name || user.username || "Anonymous User";
  const title = `${userName} - Crypto Bonuses`;
  const description = `View ${userName}'s activity and profile on Crypto Bonuses.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      images: user.profilePicture || user.image ? [
        {
          url: user.profilePicture || user.image || "",
          width: 400,
          height: 400,
          alt: `${userName}'s profile picture`,
        }
      ] : [],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: user.profilePicture || user.image ? [user.profilePicture || user.image || ""] : [],
    },
    alternates: {
      canonical: `https://cryptobonuses.com/user/${params.username}`,
    },
  };
}

export default async function UserProfilePage({ params }: Props) {
  const user = await getUser(params.username);

  if (!user) {
    notFound();
  }

  return <UserProfileClient user={user} />;
} 