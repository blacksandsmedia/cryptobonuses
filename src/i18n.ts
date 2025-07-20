import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

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

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  return {
    messages: (await import(`../messages/${locale}.json`)).default,
    locale: locale as string
  };
}); 