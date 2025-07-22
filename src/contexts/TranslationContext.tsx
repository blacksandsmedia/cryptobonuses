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
  t: (key: string) => string;
  messages: Messages;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationProviderProps {
  children: ReactNode;
  locale: Locale;
}

export function TranslationProvider({ children, locale }: TranslationProviderProps) {
  const currentMessages = messages[locale] || messages.en;

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = currentMessages;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
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