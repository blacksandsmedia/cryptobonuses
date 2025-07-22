'use client';

import { useTranslation } from '@/contexts/TranslationContext';

interface TranslatedSectionHeaderProps {
  translationKey: string;
  fallback: string;
  className?: string;
  casinoName?: string;
}

export default function TranslatedSectionHeader({ 
  translationKey, 
  fallback, 
  className = "text-xl sm:text-2xl font-bold mb-2 sm:mb-3",
  casinoName 
}: TranslatedSectionHeaderProps) {
  // Add translation support with fallback
  let t;
  try {
    const translation = useTranslation();
    t = translation.t;
  } catch {
    // Not in translation context, return fallback
    t = () => fallback;
  }

  const translatedText = t(translationKey, { casinoName }) || fallback;

  return (
    <h2 className={className}>
      {translatedText}
    </h2>
  );
} 