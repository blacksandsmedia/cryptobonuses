'use client';

import { TranslationProvider } from '@/contexts/TranslationContext';
import TranslatedConditionalLayout from '@/components/TranslatedConditionalLayout';
import HomePage from '@/app/page';

interface LanguageHomePageProps {
  language: string;
}

// Simple translated homepage that renders the original homepage with translations
export function LanguageHomePage({ language }: LanguageHomePageProps) {
  return (
    <TranslationProvider locale={language as any}>
      <TranslatedConditionalLayout>
        <div className="min-h-screen bg-[#343541] text-white">
          {/* Translation Test Banner */}
          <div className="bg-green-600 text-white text-center py-2 text-sm">
            🌐 Language: {language.toUpperCase()} | Translation Active
          </div>
          <HomePage />
        </div>
      </TranslatedConditionalLayout>
    </TranslationProvider>
  );
} 