import { notFound } from 'next/navigation';
import TermsPage from '../../terms/page';
import { TranslationProvider } from '@/contexts/TranslationContext';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return [];
}

interface LangTermsPageProps {
  params: {
    slug: string;
  };
}

export default function LangTermsPage({ params }: LangTermsPageProps) {
  const { slug: lang } = params;
  
  // Validate that the slug is a valid language code
  const supportedLanguages = ['pl', 'tr', 'es', 'pt', 'vi', 'ja', 'ko', 'fr'];
  
  if (!supportedLanguages.includes(lang)) {
    notFound();
  }
  
  return (
    <TranslationProvider locale={lang as any}>
      <TermsPage />
    </TranslationProvider>
  );
} 