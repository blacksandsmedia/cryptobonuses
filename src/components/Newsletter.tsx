"use client";

import { useState } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
  // Add translation support with fallback - improved detection
  let t;
  let hasTranslationContext = false;
  
  try {
    const translation = useTranslation();
    if (translation && translation.t) {
      t = translation.t;
      hasTranslationContext = true;
    } else {
      throw new Error('No translation context');
    }
  } catch {
    // Not in translation context, return English fallbacks
    hasTranslationContext = false;
    const englishTranslations: Record<string, string> = {
      'newsletter.title': 'Stay Updated with the Latest Casino Bonuses',
      'newsletter.description': 'Get exclusive bonus codes, new casino reviews, and special offers delivered straight to your inbox. Never miss out on the best crypto casino deals!',
      'newsletter.emailPlaceholder': 'Enter your email address',
      'newsletter.subscribing': 'Subscribing...',
      'newsletter.subscribe': 'Subscribe',
      'newsletter.trust.noSpam': 'No spam, ever',
      'newsletter.trust.weeklyUpdates': 'Weekly updates',
      'newsletter.trust.unsubscribe': 'Unsubscribe anytime'
    };
    t = (key: string) => englishTranslations[key] || key;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to subscribe. Please try again.');
    }
  };

  return (
    <section className="bg-[#2c2f3a] border-t border-[#404055]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {t('newsletter.title') || 'Stay Updated with the Latest Casino Bonuses'}
          </h2>
          <p className="text-[#a4a5b0] text-lg mb-8">
            {t('newsletter.description') || 'Get exclusive bonus codes, new casino reviews, and special offers delivered straight to your inbox. Never miss out on the best crypto casino deals!'}
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <div className="flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('newsletter.emailPlaceholder') || 'Enter your email address'}
                required
                disabled={status === 'loading'}
                className="w-full px-4 py-3 bg-[#343541] border-2 border-[#404055] rounded-xl text-white placeholder-[#8b8c98] focus:outline-none focus:ring-2 focus:ring-[#68D08B] focus:border-transparent transition-all duration-200 disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading' || !email.trim()}
              className="px-8 py-3 bg-[#68D08B] hover:bg-[#5abc7a] text-[#343541] font-semibold rounded-xl transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {status === 'loading' ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  {t('newsletter.subscribing') || 'Subscribing...'}
                </span>
              ) : (
                t('newsletter.subscribe') || 'Subscribe'
              )}
            </button>
          </form>

          {/* Status Messages */}
          {message && (
            <div className={`mt-4 p-3 rounded-lg text-center ${
              status === 'success' ? 'bg-green-500 text-white' :
              status === 'error' ? 'bg-red-500 text-white' :
              'bg-gray-600 text-white'
            }`}>
              {message}
            </div>
          )}

          {/* Trust Indicators */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-sm text-[#8b8c98]">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#68D08B]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              {t('newsletter.trust.noSpam') || 'No spam, ever'}
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#68D08B]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
              {t('newsletter.trust.weeklyUpdates') || 'Weekly updates'}
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#68D08B]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd"/>
              </svg>
              {t('newsletter.trust.unsubscribe') || 'Unsubscribe anytime'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 