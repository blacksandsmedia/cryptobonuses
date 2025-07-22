'use client';

import { createContext, useContext, ReactNode } from 'react';

// Import all message files
import enMessages from '@/messages/en.json';
import trMessages from '@/messages/tr.json';
import plMessages from '@/messages/pl.json';

export type Locale = 'en' | 'tr' | 'pl' | 'es' | 'pt' | 'vi' | 'ja' | 'ko' | 'fr';

type Messages = typeof enMessages;

const messages: Record<Locale, Messages> = {
  en: enMessages,
  tr: trMessages,
  pl: plMessages,
  // For now, fallback to English for other languages
  es: enMessages,
  pt: enMessages,
  vi: enMessages,
  ja: enMessages,
  ko: enMessages,
  fr: enMessages,
};

interface TranslationContextType {
  locale: Locale;
  t: (key: string, interpolations?: Record<string, string | number>) => string;
  messages: Messages;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationProviderProps {
  children: ReactNode;
  locale: Locale;
}

export function TranslationProvider({ children, locale }: TranslationProviderProps) {
  const currentMessages = messages[locale] || messages.en;

  const t = (key: string, interpolations?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = currentMessages;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (!value) return key;
    
    // Handle interpolation for variables like {year}, {count}
    if (interpolations && typeof value === 'string') {
      return Object.entries(interpolations).reduce((text, [key, replacement]) => {
        return text.replace(new RegExp(`\\{${key}\\}`, 'g'), String(replacement));
      }, value);
    }
    
    return value;
  };

  return (
    <TranslationContext.Provider value={{ locale, t, messages: currentMessages }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
} 