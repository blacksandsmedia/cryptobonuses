'use client';

import { useState, useEffect } from 'react';
import { TranslationProvider, useTranslation, type Locale } from '@/contexts/TranslationContext';

// Component that uses the translation context
function TranslationContent() {
  const { locale, t } = useTranslation();
  
  return (
    <div className="bg-[#68D08B]/10 border border-[#68D08B] rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-[#68D08B] rounded-full animate-pulse"></div>
        <span className="text-[#68D08B] font-semibold">🌐 Translation Active: {locale.toUpperCase()}</span>
      </div>
      <div className="text-white text-sm mb-2">
        <strong>Homepage Title:</strong> {t('homepage.title')}
      </div>
      <div className="text-[#a4a5b0] text-xs">
        <strong>Description:</strong> {t('homepage.description').substring(0, 100)}...
      </div>
    </div>
  );
}

// Main demo component that detects locale from URL and provides context
export default function TranslationDemo() {
  const [currentLocale, setCurrentLocale] = useState<Locale>('en');

  useEffect(() => {
    // Detect locale from current URL
    const path = window.location.pathname;
    const segments = path.split('/');
    const supportedLanguages: Locale[] = ['pl', 'tr', 'es', 'pt', 'vi', 'ja', 'ko', 'fr'];
    
    if (segments[1] && supportedLanguages.includes(segments[1] as Locale)) {
      setCurrentLocale(segments[1] as Locale);
    } else {
      setCurrentLocale('en');
    }
  }, []);

  return (
    <TranslationProvider locale={currentLocale}>
      <TranslationContent />
    </TranslationProvider>
  );
} 