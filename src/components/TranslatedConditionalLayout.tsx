'use client';

import { useTranslation } from '@/contexts/TranslationContext';
import Newsletter from './Newsletter';

interface TranslatedConditionalLayoutProps {
  children: React.ReactNode;
}

export default function TranslatedConditionalLayout({ children }: TranslatedConditionalLayoutProps) {
  const { t, locale } = useTranslation();
  
  return (
    <>
      {/* Simple translated header */}
      <header className="fixed top-0 w-full bg-[#343541] border-b border-[#404055] shadow-md z-50">
        <div className="mx-auto w-[90%] max-w-[1280px] h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-white font-bold text-lg">CryptoBonuses</a>
            <span className="text-[#68D08B] text-sm">({locale.toUpperCase()})</span>
          </div>
          
          {/* Simple translated navigation */}
          <nav className="flex items-center space-x-4">
            <a href={`/${locale === 'en' ? '' : locale + '/'}spin`} className="text-[#a4a5b0] hover:text-[#68D08B]">
              {t('nav.spin')}
            </a>
            <a href={`/${locale === 'en' ? '' : locale + '/'}contact`} className="text-[#a4a5b0] hover:text-[#68D08B]">
              {t('nav.contact')}
            </a>
          </nav>
        </div>
      </header>

      {/* Add padding for fixed header */}
      <div style={{ paddingTop: '64px' }}>
        {children}
      </div>

      {/* Newsletter Section */}
      <Newsletter />

      {/* Simple footer */}
      <footer className="bg-[#2a2b36] border-t border-[#404055] py-8 px-4">
        <div className="mx-auto max-w-[1280px] text-center">
          <p className="text-[#a4a5b0] text-sm">
            © 2025 {t('footer.copyright')}
          </p>
          <div className="mt-2 space-x-4">
            <a href={`/${locale === 'en' ? '' : locale + '/'}terms`} className="text-[#a4a5b0] hover:text-[#68D08B] text-sm">
              {t('nav.terms')}
            </a>
            <a href={`/${locale === 'en' ? '' : locale + '/'}privacy`} className="text-[#a4a5b0] hover:text-[#68D08B] text-sm">
              {t('nav.privacy')}
            </a>
          </div>
        </div>
      </footer>
    </>
  );
} 