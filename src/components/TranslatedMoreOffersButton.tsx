'use client';

import { useTranslation } from '@/contexts/TranslationContext';

interface TranslatedMoreOffersButtonProps {
  className?: string;
}

export default function TranslatedMoreOffersButton({ 
  className = "bg-gradient-to-r from-[#68D08B] to-[#5abc7a] hover:from-[#5abc7a] hover:to-[#4da968] text-[#343541] text-sm font-semibold py-2 px-3 rounded-md text-center transition-all duration-300 shadow-lg hover:shadow-xl border border-[#68D08B]/20" 
}: TranslatedMoreOffersButtonProps) {
  // Add translation support with fallback
  let t;
  try {
    const translation = useTranslation();
    t = translation.t;
  } catch {
    // Not in translation context, use fallback
    t = (key: string) => key.split('.').pop() || key;
  }

  return (
    <div className={className}>
      {t('casino.viewBonus') || 'View Bonus'} →
    </div>
  );
} 