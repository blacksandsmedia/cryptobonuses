import { notFound } from 'next/navigation';
import SpinPage from '../../spin/page';
import { TranslationProvider } from '@/contexts/TranslationContext';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return [];
}

interface LangSpinPageProps {
  params: {
    slug: string;
  };
}

export default function LangSpinPage({ params }: LangSpinPageProps) {
  const { slug: lang } = params;
  
  // Validate that the slug is a valid language code
  const supportedLanguages = ['pl', 'tr', 'es', 'pt', 'vi', 'ja', 'ko', 'fr'];
  
  if (!supportedLanguages.includes(lang)) {
    notFound();
  }
  
  return (
    <TranslationProvider locale={lang as any}>
      <SpinPage />
    </TranslationProvider>
  );
} 