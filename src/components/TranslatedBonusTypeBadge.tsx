'use client';

import { useTranslation } from '@/contexts/TranslationContext';
import Link from 'next/link';

interface TranslatedBonusTypeBadgeProps {
  type: string;
  href: string;
  className?: string;
}

export default function TranslatedBonusTypeBadge({ 
  type, 
  href, 
  className = "bg-[#2c2f3a] text-[#68D08B] px-3 py-1 rounded-lg text-sm font-medium hover:bg-[#68D08B] hover:text-[#1a1a1a] transition-colors cursor-pointer" 
}: TranslatedBonusTypeBadgeProps) {
  // Add translation support with fallback
  let t;
  try {
    const translation = useTranslation();
    t = translation.t;
  } catch {
    // Not in translation context, use fallback
    t = (key: string) => key.split('.').pop() || key;
  }

  // Translation mapping for bonus types
  const getBonusTypeTranslation = (bonusType: string) => {
    const typeMap: { [key: string]: string } = {
      'welcome': t('bonusTypes.welcome') || 'WELCOME',
      'no_deposit': t('bonusTypes.noDeposit') || 'NO DEPOSIT',
      'free_spins': t('bonusTypes.freeSpins') || 'FREE SPINS',
      'reload': t('bonusTypes.reload') || 'RELOAD',
      'cashback': t('bonusTypes.cashback') || 'CASHBACK',
      'deposit': t('bonusTypes.deposit') || 'DEPOSIT',
      'rakeback': t('bonusTypes.rakeback') || 'RAKEBACK',
      'vip': t('bonusTypes.vip') || 'VIP',
      'rewards': t('bonusTypes.rewards') || 'REWARDS',
      'crypto': t('bonusTypes.crypto') || 'CRYPTO',
      'other': t('bonusTypes.other') || 'OTHER'
    };

    return typeMap[bonusType.toLowerCase()] || bonusType.replace('_', ' ').toUpperCase();
  };

  const translatedType = getBonusTypeTranslation(type);

  return (
    <Link href={href} className={className}>
      {translatedType} {t('bonusTypes.bonus') || 'BONUS'}
    </Link>
  );
} 