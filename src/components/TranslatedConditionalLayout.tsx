'use client';

import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Newsletter from './Newsletter';
import SearchModal from './SearchModal';
import CryptoTicker from './CryptoTicker';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from '@/contexts/TranslationContext';

interface TranslatedConditionalLayoutProps {
  children: React.ReactNode;
  faviconUrl?: string;
}

export default function TranslatedConditionalLayout({ children, faviconUrl }: TranslatedConditionalLayoutProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  const currentYear = new Date().getFullYear();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [hideCryptoTicker, setHideCryptoTicker] = useState(false);
  const [hideBuyCryptoButton, setHideBuyCryptoButton] = useState(false);

  // Fetch visibility settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const settings = await response.json();
        setHideCryptoTicker(settings.hideCryptoTicker || false);
        setHideBuyCryptoButton(settings.hideBuyCryptoButton || false);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    if (!isAdminPage) {
      fetchSettings();
    }
  }, [isAdminPage]);

  if (isAdminPage) {
    // For admin pages, don't show the main site header/footer
    return <>{children}</>;
  }

  // For regular pages, show the full layout
  return (
    <>
      <header className="fixed top-0 w-full bg-[#343541] border-b border-[#404055] shadow-md z-50">
        <div className="mx-auto w-[90%] md:w-[95%] max-w-[1280px] h-20 flex items-center justify-between">
          {/* Mobile Menu Button - Left */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[#a4a5b0] hover:text-[#68D08B] transition-all duration-200 p-2 rounded-lg hover:bg-white/5"
              aria-label="Toggle menu"
            >
              <svg 
                className={`w-6 h-6 transform transition-transform duration-300 ${mobileMenuOpen ? 'rotate-90' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Logo - Centered on Mobile */}
          <div className="flex-1 flex justify-center md:flex-none md:justify-start">
            <Link href="/" className="flex items-center">
              <Image
                src="https://cdn.prod.website-files.com/67dd29ae7952086f714105e7/67e11433aaedad5402a3d9c5_CryptoBonuses%20Logo%20Main.webp"
                alt="CryptoBonuses - Bitcoin Casino Bonuses"
                width={240}
                height={50}
                priority
                className="h-[50px] w-auto"
              />
            </Link>
          </div>
          
          {/* Desktop Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-6">
            <a 
              href="/spin" 
              className="text-[#a4a5b0] hover:text-[#68D08B] transition-colors duration-200 font-medium text-base"
            >
              {t('nav.spin')}
            </a>
            <a 
              href="/contact" 
              className="text-[#a4a5b0] hover:text-[#68D08B] transition-colors duration-200 font-medium text-base"
            >
              {t('nav.submitBonus')}
            </a>
            {!hideBuyCryptoButton && (
              <a
                href="https://login.coinbase.com/signup?action=signup&clickId=xm1VZp24-xycU37VwcXve1RcUksVa3zP5Q0kWM0&client_id=258660e1-9cfe-4202-9eda-d3beedb3e118&locale=en&oauth_challenge=fdcffb12-d2e9-411c-a129-7b9e5135f8cf&utm_campaign=rt_p_m_w_d_acq_imp_gro_aff_Black+Sands+Media&utm_content=552039&utm_creative=Online+Tracking+Link&utm_medium=growthp&utm_source=impact"
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="bg-[#68D08B] hover:bg-[#5abc7a] text-[#343541] font-medium px-2.5 py-1.5 rounded-md transition-colors duration-200 flex items-center gap-1.5 text-sm"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                {t('nav.buyCrypto')}
              </a>
            )}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="text-[#a4a5b0] hover:text-[#68D08B] transition-colors duration-200 font-medium flex items-center gap-2 text-base"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {t('nav.search')}
            </button>
            <LanguageSelector />
          </nav>

          {/* Right Side Actions - Mobile */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="text-[#a4a5b0] hover:text-[#68D08B] transition-colors duration-200 p-2 rounded-lg hover:bg-white/5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <LanguageSelector />
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#404055] bg-[#343541] shadow-lg">
            <nav className="px-4 py-4 space-y-4">
              <a 
                href="/spin" 
                className="block text-[#a4a5b0] hover:text-[#68D08B] transition-colors duration-200 font-medium py-2 px-3 rounded-lg hover:bg-white/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.spin')}
              </a>
              <a 
                href="/contact" 
                className="block text-[#a4a5b0] hover:text-[#68D08B] transition-colors duration-200 font-medium py-2 px-3 rounded-lg hover:bg-white/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.submitBonus')}
              </a>
              {!hideBuyCryptoButton && (
                <a
                  href="https://login.coinbase.com/signup?action=signup&clickId=xm1VZp24-xycU37VwcXve1RcUksVa3zP5Q0kWM0&client_id=258660e1-9cfe-4202-9eda-d3beedb3e118&locale=en&oauth_challenge=fdcffb12-d2e9-411c-a129-7b9e5135f8cf&utm_campaign=rt_p_m_w_d_acq_imp_gro_aff_Black+Sands+Media&utm_content=552039&utm_creative=Online+Tracking+Link&utm_medium=growthp&utm_source=impact"
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="block bg-[#68D08B] hover:bg-[#5abc7a] text-[#343541] font-medium px-3 py-2 rounded-md transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.buyCrypto')}
                </a>
              )}
            </nav>
          </div>
        )}
      </header>

      {!hideCryptoTicker && <CryptoTicker />}

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-[#2a2b36] border-t border-[#404055] py-12 px-4">
        <div className="mx-auto w-[90%] md:w-[95%] max-w-[1280px]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <Image
                  src="https://cdn.prod.website-files.com/67dd29ae7952086f714105e7/67e11433aaedad5402a3d9c5_CryptoBonuses%20Logo%20Main.webp"
                  alt="CryptoBonuses"
                  width={200}
                  height={42}
                  className="h-[42px] w-auto"
                />
              </div>
              <p className="text-[#a4a5b0] text-sm leading-relaxed mb-4">
                Your trusted source for the best Bitcoin casino bonuses and crypto gambling offers. 
                We review and verify all bonuses to ensure you get the best deals available.
              </p>
              <div className="flex space-x-4">
                <a 
                  href="https://twitter.com/cryptobonuses" 
                  className="text-[#a4a5b0] hover:text-[#68D08B] transition-colors duration-200"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a 
                  href="https://t.me/cryptobonuses" 
                  className="text-[#a4a5b0] hover:text-[#68D08B] transition-colors duration-200"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">{t('nav.language')}</h3>
              <ul className="space-y-2">
                <li><a href="/contact" className="text-[#a4a5b0] hover:text-[#68D08B] transition-colors duration-200">{t('nav.contact')}</a></li>
                <li><a href="/terms" className="text-[#a4a5b0] hover:text-[#68D08B] transition-colors duration-200">{t('nav.terms')}</a></li>
                <li><a href="/privacy" className="text-[#a4a5b0] hover:text-[#68D08B] transition-colors duration-200">{t('nav.privacy')}</a></li>
              </ul>
            </div>
            
            <div>
              <Newsletter />
            </div>
          </div>
          
          <div className="border-t border-[#404055] mt-8 pt-8 text-center">
            <p className="text-[#a4a5b0] text-sm">
              © {currentYear} {t('footer.copyright')}
            </p>
          </div>
        </div>
      </footer>

      {/* Search Modal */}
      <SearchModal 
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  );
} 