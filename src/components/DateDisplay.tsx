'use client';

import React from 'react';
import { useTranslation } from '@/contexts/TranslationContext';

interface DateDisplayProps {
  publishedAt?: Date | string;
  modifiedAt?: Date | string;
  showLabels?: boolean;
  className?: string;
}

export default function DateDisplay({ 
  publishedAt, 
  modifiedAt, 
  showLabels = true, 
  className = '' 
}: DateDisplayProps) {
  // Add translation support with fallback
  let t;
  try {
    const translation = useTranslation();
    t = translation.t;
  } catch {
    // Not in translation context, return English fallbacks
    const englishTranslations: Record<string, string> = {
      'casino.published': 'Published',
      'casino.lastUpdated': 'Last Updated',
      'common.published': 'Published',
      'common.modified': 'Modified'
    };
    t = (key: string) => englishTranslations[key] || key;
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return null;
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const publishedDate = formatDate(publishedAt);
  const modifiedDate = formatDate(modifiedAt);

  // Don't render if no dates are provided
  if (!publishedDate && !modifiedDate) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-4 text-sm text-[#a4a5b0] ${className}`}>
      {publishedDate && (
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
          </svg>
          <span>
            {showLabels && `${t('common.published') || 'Published'}: `}
            <time dateTime={typeof publishedAt === 'string' ? publishedAt : publishedAt?.toISOString()}>
              {publishedDate}
            </time>
          </span>
        </div>
      )}
      
      {modifiedDate && modifiedDate !== publishedDate && (
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          <span>
            {showLabels && `${t('common.modified') || 'Modified'}: `}
            <time dateTime={typeof modifiedAt === 'string' ? modifiedAt : modifiedAt?.toISOString()}>
              {modifiedDate}
            </time>
          </span>
        </div>
      )}
    </div>
  );
} 