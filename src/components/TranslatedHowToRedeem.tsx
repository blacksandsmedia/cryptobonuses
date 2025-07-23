'use client';

import { useTranslation } from '@/contexts/TranslationContext';
import RichContent from '@/components/casino/RichContent';

interface TranslatedHowToRedeemProps {
  content?: string;
  bonusCode?: string | null;
  casinoName: string;
  affiliateLink?: string;
  codeTermLabel?: string;
  codeTypeCapitalized?: string;
  casinoData?: any;
  bonusData?: any;
  analyticsData?: any;
}

export default function TranslatedHowToRedeem({
  content,
  bonusCode,
  casinoName,
  affiliateLink,
  codeTermLabel,
  codeTypeCapitalized,
  casinoData,
  bonusData,
  analyticsData
}: TranslatedHowToRedeemProps) {
  // Add translation support with fallback
  let t;
  try {
    const translation = useTranslation();
    t = translation.t;
  } catch {
    // Not in translation context, return English fallbacks
    const englishTranslations: Record<string, string> = {
      'casino.step1WithCode': `Click the "Get Bonus" button above to visit ${casinoName}'s website.`,
      'casino.step1NoCode': `Click the "Get Bonus" button above to visit ${casinoName}'s website.`,
      'casino.step2': 'Create your account and verify your email.',
      'casino.step3': 'Make your first deposit using cryptocurrency.',
      'casino.step4': `Enter ${codeTypeCapitalized} ${bonusCode} during deposit.`,
      'casino.step5': 'Start playing and enjoy your bonus!'
    };
    t = (key: string, interpolations?: Record<string, string | number>) => {
      let text = englishTranslations[key] || key;
      if (interpolations && typeof text === 'string') {
        Object.entries(interpolations).forEach(([key, value]) => {
          text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
        });
      }
      return text;
    };
  }

  // Generate translated fallback content if no custom content provided
  const getFallbackContent = () => {
    // If not in translation context, return plain English directly
    try {
      useTranslation(); // Test if we're in translation context
      // We are in translation context, use the t() function
      if (bonusCode) {
        return `1. ${t('casino.step1WithCode', { casinoName }) || `Click the "Get Bonus" button above to visit ${casinoName}'s website.`}
2. ${t('casino.step2') || 'Create your account and verify your email.'}
3. ${t('casino.step3') || 'Make your first deposit using cryptocurrency.'}
4. ${t('casino.step4', { codeType: codeTypeCapitalized, bonusCode }) || `Enter ${codeTypeCapitalized} ${bonusCode} during deposit.`}
5. ${t('casino.step5') || 'Start playing and enjoy your bonus!'}`;
      } else {
        return `1. ${t('casino.step1NoCode', { casinoName }) || `Click the "Get Bonus" button above to visit ${casinoName}'s website.`}
2. ${t('casino.step2') || 'Create your account and verify your email.'}
3. ${t('casino.step5') || 'Start playing and enjoy your bonus!'}`;
      }
    } catch {
      // Not in translation context, return plain English
      if (bonusCode) {
        return `1. Click the "Get Bonus" button above to visit ${casinoName}'s website.
2. Create your account and verify your email.
3. Make your first deposit using cryptocurrency.
4. Enter ${codeTypeCapitalized || 'Bonus Code'} ${bonusCode} during deposit.
5. Start playing and enjoy your bonus!`;
      } else {
        return `1. Click the "Get Bonus" button above to visit ${casinoName}'s website.
2. Create your account and verify your email.
3. Start playing and enjoy your bonus!`;
      }
    }
  };

  const finalContent = content || getFallbackContent();

  return (
    <RichContent 
      content={finalContent}
      type="howToRedeem" 
      bonusCode={bonusCode}
      casinoName={casinoName}
      affiliateLink={affiliateLink}
      codeTermLabel={codeTermLabel}
      casinoData={casinoData}
      bonusData={bonusData}
      analyticsData={analyticsData}
    />
  );
} 