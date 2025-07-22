'use client';

import { useTranslation } from '@/contexts/TranslationContext';

interface TranslatedTableLabelProps {
  translationKey: string;
  fallback: string;
  className?: string;
}

export default function TranslatedTableLabel({ 
  translationKey, 
  fallback, 
  className = "h-full flex items-center" 
}: TranslatedTableLabelProps) {
  // Add translation support with fallback
  let t;
  try {
    const translation = useTranslation();
    t = translation.t;
  } catch {
    // Not in translation context, use fallback
    t = (key: string) => key.split('.').pop() || key;
  }

  const translatedText = t(translationKey) || fallback;

  return (
    <div className={className}>
      {translatedText}
    </div>
  );
} 