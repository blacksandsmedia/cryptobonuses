'use client';

import { useContext } from 'react';
import TranslatableHeroSection from './TranslatableHeroSection';

// We'll create a simple context check without importing the full context to avoid circular dependencies
const TranslationContext = require('@/contexts/TranslationContext').TranslationContext;

interface ConditionalTranslatableContentProps {
  totalUsers: number;
  currentYear: number;
  fallback: React.ReactNode;
}

export default function ConditionalTranslatableContent({ 
  totalUsers, 
  currentYear, 
  fallback 
}: ConditionalTranslatableContentProps) {
  // Check if we're inside a translation context
  const translationContext = useContext(TranslationContext);
  
  if (translationContext) {
    // We're in a translation context, use the translatable version
    return <TranslatableHeroSection totalUsers={totalUsers} currentYear={currentYear} />;
  }
  
  // Not in a translation context, render the fallback (original English content)
  return <>{fallback}</>;
} 