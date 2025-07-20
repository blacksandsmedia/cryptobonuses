// Define supported locales
export const locales = ['en', 'pl', 'tr', 'es', 'pt', 'vi', 'ja', 'ko', 'fr'] as const;
export type Locale = typeof locales[number];

// Default locale (English) - no prefix
export const defaultLocale = 'en' as const;

// Locale configuration with names and RTL support
export const localeConfig = {
  en: { name: 'English', flag: '🇺🇸' },
  pl: { name: 'Polski', flag: '🇵🇱' },
  tr: { name: 'Türkçe', flag: '🇹🇷' },
  es: { name: 'Español', flag: '🇪🇸' },
  pt: { name: 'Português', flag: '🇵🇹' },
  vi: { name: 'Tiếng Việt', flag: '🇻🇳' },
  ja: { name: '日本語', flag: '🇯🇵' },
  ko: { name: '한국어', flag: '🇰🇷' },
  fr: { name: 'Français', flag: '🇫🇷' },
} as const; 