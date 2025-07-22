'use client';

import { TranslationProvider } from '@/contexts/TranslationContext';
import TranslatedConditionalLayout from '@/components/TranslatedConditionalLayout';
import TranslatedHomePage from '@/components/TranslatedHomePage';

interface LanguageHomePageProps {
  language: string;
}

export async function LanguageHomePage({ language }: LanguageHomePageProps) {
  return (
    <TranslationProvider locale={language as any}>
      <TranslatedConditionalLayout>
        <TranslatedHomePage />
      </TranslatedConditionalLayout>
    </TranslationProvider>
  );
} 