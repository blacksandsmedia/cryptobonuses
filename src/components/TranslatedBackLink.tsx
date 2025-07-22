'use client';

import Link from 'next/link';
import { useTranslation } from '@/contexts/TranslationContext';

interface TranslatedBackLinkProps {
  href?: string;
  className?: string;
}

export default function TranslatedBackLink({
  href = "/",
  className = "text-[#a4a5b0] hover:text-[#68D08B] flex items-center gap-2 px-1 transition-colors"
}: TranslatedBackLinkProps) {
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
    <Link href={href} className={className}>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      {t('casino.backToAllBonuses') || 'Back to all bonuses'}
    </Link>
  );
} 