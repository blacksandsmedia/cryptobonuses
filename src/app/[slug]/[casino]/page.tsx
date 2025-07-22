import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import SlugPage from '../page';
import { TranslationProvider } from '@/contexts/TranslationContext';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
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
    select: { id: true, name: true }
  });
  
  if (!casinoExists) {
    notFound();
  }
  
  // Import and render the original casino page logic
  const SlugPage = (await import('../page')).default;
  const casinoPageProps = {
    params: {
      slug: casinoSlug
    }
  };
  
  return (
    <TranslationProvider locale={lang as any}>
      <SlugPage {...casinoPageProps} />
    </TranslationProvider>
  );
} 