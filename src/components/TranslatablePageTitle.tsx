'use client';

import { useTranslation } from '@/contexts/TranslationContext';
import { SafeTranslatedText } from './SafeTranslatedContent';

interface TranslatablePageTitleProps {
  translationKey: string;
  fallback: string;
  className?: string;
}

export function TranslatablePageTitle({ translationKey, fallback, className }: TranslatablePageTitleProps) {
  return (
    <h1 className={className}>
      <SafeTranslatedText 
        translationKey={translationKey} 
        fallback={fallback} 
      />
    </h1>
  );
}

// A simple demo component that shows the translation is working
export function LanguageDemo() {
  const { locale, t } = useTranslation();
  
  return (
    <div className="bg-[#68D08B]/10 border border-[#68D08B] rounded-lg p-4 mb-6">
      <div className="text-[#68D08B] font-semibold mb-2">
        🌐 Translation Active: {locale.toUpperCase()}
      </div>
      <div className="text-white text-sm">
        {t('homepage.title')}
      </div>
    </div>
  );
} 