import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';
import CasinoPage from '../../[slug]/page';

// Make this route fully dynamic to avoid conflicts with root [slug] routes
export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  // Return empty array to make this fully dynamic and avoid route conflicts
  return [];
}

interface LangCasinoPageProps {
  params: {
    lang: string;
    slug: string;
  };
}

export default async function LangCasinoPage({ params }: LangCasinoPageProps) {
  // For now, just render the main casino page logic
  // In the future, this could have localized content
  const casinoPageProps = {
    params: {
      slug: params.slug
    }
  };
  
  return <CasinoPage {...casinoPageProps} />;
} 