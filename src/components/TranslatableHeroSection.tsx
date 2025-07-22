'use client';

import { useTranslation } from '@/contexts/TranslationContext';

interface TranslatableHeroSectionProps {
  totalUsers: number;
  currentYear: number;
}

export default function TranslatableHeroSection({ totalUsers, currentYear }: TranslatableHeroSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="text-center mb-16">
      <div className="inline-flex items-center gap-2 bg-[#68D08B]/10 border border-[#68D08B]/20 rounded-full px-6 py-3 mb-6">
        <div className="w-2 h-2 bg-[#68D08B] rounded-full animate-pulse"></div>
        <span className="text-[#68D08B] text-sm font-medium">
          Trusted by {totalUsers >= 1000 ? `${Math.floor(totalUsers / 1000)}K+` : `${totalUsers}+`} Players
        </span>
      </div>
      
      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 sm:mb-6 bg-gradient-to-r from-white to-[#a4a5b0] bg-clip-text text-transparent leading-tight py-2">
        {t('homepage.title')}
      </h2>
      
      <p className="text-[#a4a5b0] max-w-3xl mx-auto text-base sm:text-lg md:text-xl leading-relaxed mb-6 sm:mb-8">
        {t('homepage.description')}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <div className="flex items-center gap-2 text-[#68D08B]">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12l2 2 4-4"/>
            <path d="M21 12c.552 0 1-.448 1-1V8c0-.552-.448-1-1-1s-1 .448-1 1v3c0 .552.448 1 1 1z"/>
            <path d="M3 12c-.552 0-1-.448-1-1V8c0-.552-.448-1 1-1s1 .448 1 1v3c0-.552-.448-1-1-1z"/>
            <path d="M12 21c.552 0 1-.448 1-1v-3c0-.552-.448-1-1-1s-1 .448-1 1v3c0 .552.448 1 1 1z"/>
            <path d="M12 3c-.552 0-1 .448-1 1v3c0 .552.448 1 1 1s1-.448 1-1V4c0-.552-.448-1-1-1z"/>
          </svg>
          <span className="text-sm font-medium">Verified Bonuses</span>
        </div>
        <div className="flex items-center gap-2 text-[#68D08B]">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          <span className="text-sm font-medium">Exclusive Codes</span>
        </div>
        <div className="flex items-center gap-2 text-[#68D08B]">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          <span className="text-sm font-medium">No Hidden Fees</span>
        </div>
      </div>
    </div>
  );
} 