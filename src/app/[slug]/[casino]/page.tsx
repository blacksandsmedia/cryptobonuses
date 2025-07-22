import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import SlugPage from '../page';

// Make this route fully dynamic
export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  // Return empty array to make this fully dynamic and avoid route conflicts
  return [];
}

interface LangCasinoPageProps {
  params: {
    slug: string;
    casino: string;
  };
}

export default async function LangCasinoPage({ params }: LangCasinoPageProps) {
  const { slug: lang, casino: casinoSlug } = params;
  
  // Validate that the first slug is a valid language code
  const supportedLanguages = ['pl', 'tr', 'es', 'pt', 'vi', 'ja', 'ko', 'fr'];
  
  if (!supportedLanguages.includes(lang)) {
    notFound();
  }
  
  // Check if the casino exists
  const casinoExists = await prisma.casino.findUnique({
    where: { slug: casinoSlug },
    select: { id: true }
  });
  
  if (!casinoExists) {
    notFound();
  }
  
  // Render the casino page with the casino slug
  // The original casino page logic will handle rendering the casino
  const casinoPageProps = {
    params: {
      slug: casinoSlug
    }
  };
  
  return <SlugPage {...casinoPageProps} />;
} 