import { notFound } from 'next/navigation';
import PrivacyPage from '../../privacy/page';
import { TranslationProvider } from '@/contexts/TranslationContext';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return [];
}

interface LangPrivacyPageProps {
  params: {
    slug: string;
  };
}

export default function LangPrivacyPage({ params }: LangPrivacyPageProps) {
  const { slug: lang } = params;
  
  // Validate that the slug is a valid language code
  const supportedLanguages = ['pl', 'tr', 'es', 'pt', 'vi', 'ja', 'ko', 'fr'];
  
  if (!supportedLanguages.includes(lang)) {
    notFound();
  }
  
  return (
    <TranslationProvider locale={lang as any}>
      <PrivacyPage />
    </TranslationProvider>
  );
} 