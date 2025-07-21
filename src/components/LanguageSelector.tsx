'use client';

import { useState, useEffect } from 'react';

// Simple locale configuration
const locales = ['en', 'pl', 'tr', 'es', 'pt', 'vi', 'ja', 'ko', 'fr'];
const defaultLocale = 'en';

const localeConfig = {
  en: { name: 'English', flag: '🇺🇸' },
  pl: { name: 'Polski', flag: '🇵🇱' },
  tr: { name: 'Türkçe', flag: '🇹🇷' },
  es: { name: 'Español', flag: '🇪🇸' },
  pt: { name: 'Português', flag: '🇵🇹' },
  vi: { name: 'Tiếng Việt', flag: '🇻🇳' },
  ja: { name: '日本語', flag: '🇯🇵' },
  ko: { name: '한국어', flag: '🇰🇷' },
  fr: { name: 'Français', flag: '🇫🇷' },
};

type Locale = keyof typeof localeConfig;

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);

  // Get current locale from localStorage or default to English
  const getCurrentLocale = (): Locale => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('preferred-language') as Locale;
      return saved && locales.includes(saved) ? saved : defaultLocale;
    }
    return defaultLocale;
  };

  const [currentLocale, setCurrentLocale] = useState<Locale>(defaultLocale);

  // Initialize locale from localStorage on mount
  useEffect(() => {
    setCurrentLocale(getCurrentLocale());
  }, []);

  const handleLanguageChange = (newLocale: Locale) => {
    // Save preference to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-language', newLocale);
    }
    
    // Update current state
    setCurrentLocale(newLocale);
    
    // Close dropdown
    setIsOpen(false);
    
    // Show a brief notification that language will be applied
    if (newLocale !== 'en') {
      alert(`Language changed to ${localeConfig[newLocale].name}. Full translation coming soon!`);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#a4a5b0] hover:text-[#68D08B] transition-colors duration-200 rounded-md hover:bg-white/5"
        aria-label="Select Language"
      >
        <span>{localeConfig[currentLocale].flag}</span>
        <span className="hidden sm:block">{localeConfig[currentLocale].name}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-[#2c2f3a] border border-[#404055] rounded-md shadow-lg z-50">
            <div className="py-2">
              <div className="px-3 py-2 text-xs font-semibold text-[#68D08B] uppercase tracking-wider">
                Select Language
              </div>
                              {locales.map((locale) => (
                  <button
                    key={locale}
                    onClick={() => handleLanguageChange(locale as Locale)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-[#343541] transition-colors ${
                      currentLocale === locale ? 'bg-[#343541] text-[#68D08B]' : 'text-[#a4a5b0]'
                    }`}
                  >
                    <span>{localeConfig[locale as Locale].flag}</span>
                    <span>{localeConfig[locale as Locale].name}</span>
                    {currentLocale === locale && (
                      <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 