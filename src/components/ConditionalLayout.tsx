'use client';

import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Newsletter from './Newsletter';
import SearchModal from './SearchModal';
import CryptoTicker from './CryptoTicker';
import LanguageSelector from './LanguageSelector';

interface ConditionalLayoutProps {
  children: React.ReactNode;
  faviconUrl?: string;
}

export default function ConditionalLayout({ children, faviconUrl }: ConditionalLayoutProps) {
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
              Spin Wheel
            </a>
            <a 
              href="/contact" 
              className="text-[#a4a5b0] hover:text-[#68D08B] transition-colors duration-200 font-medium text-base"
            >
              Submit Bonus
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
                Buy Crypto
              </a>
            )}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="text-[#a4a5b0] hover:text-[#68D08B] transition-colors duration-200 font-medium flex items-center gap-2 text-base"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <LanguageSelector />
          </nav>
          
          {/* Search button on mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="text-[#a4a5b0] hover:text-[#68D08B] transition-all duration-200 p-2 rounded-lg hover:bg-white/5"
              aria-label="Search"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="bg-[#2a2c36] border-t border-[#404055] backdrop-blur-sm">
            <nav className="px-6 py-6">
              <div className="flex flex-col items-center space-y-4">
                <button
                  onClick={() => {
                    setSearchModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="block text-[#a4a5b0] hover:text-[#68D08B] transition-all duration-200 font-medium py-3 px-6 rounded-lg hover:bg-white/5 text-center w-full max-w-xs text-base"
                >
                  <div className="flex items-center justify-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Search</span>
                  </div>
                </button>
                <a 
                  href="/spin" 
                  className="block text-[#a4a5b0] hover:text-[#68D08B] transition-all duration-200 font-medium py-3 px-6 rounded-lg hover:bg-white/5 text-center w-full max-w-xs text-base"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center justify-center gap-3">
                    <span>Spin Wheel</span>
                    <div className="bg-[#68D08B]/20 text-[#68D08B] rounded-full px-2 py-0.5 font-bold text-xs">
                      WIN!
                    </div>
                  </div>
                </a>
                <a 
                  href="/contact" 
                  className="block text-[#a4a5b0] hover:text-[#68D08B] transition-all duration-200 font-medium py-3 px-6 rounded-lg hover:bg-white/5 text-center w-full max-w-xs text-base"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center justify-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <span>Submit Bonus</span>
                  </div>
                </a>
                {!hideBuyCryptoButton && (
                  <a
                    href="https://login.coinbase.com/signup?action=signup&clickId=xm1VZp24-xycU37VwcXve1RcUksVa3zP5Q0kWM0&client_id=258660e1-9cfe-4202-9eda-d3beedb3e118&locale=en&oauth_challenge=fdcffb12-d2e9-411c-a129-7b9e5135f8cf&utm_campaign=rt_p_m_w_d_acq_imp_gro_aff_Black+Sands+Media&utm_content=552039&utm_creative=Online+Tracking+Link&utm_medium=growthp&utm_source=impact"
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="bg-[#68D08B] hover:bg-[#5abc7a] text-[#343541] font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-center w-full max-w-xs text-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <span>Buy Crypto</span>
                      <div className="bg-[#343541]/30 text-[#343541] rounded-full px-1.5 py-0.5 font-bold text-xs">
                        SECURE
                      </div>
                    </div>
                  </a>
                )}
              </div>

              {/* Language Selector for Mobile */}
              <div className="mt-4 pt-4 border-t border-[#404055] flex justify-center">
                <LanguageSelector />
              </div>
              
              {/* Menu Footer */}
              <div className="mt-6 pt-4 border-t border-[#404055] text-center">
                <p className="text-xs text-[#a4a5b0]">
                  CryptoBonuses.com
                </p>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Crypto Ticker - fixed positioned right below the header */}
      {!hideCryptoTicker && (
        <div className="fixed top-20 left-0 right-0 z-40">
          <CryptoTicker />
        </div>
      )}

      {/* Main content with padding for both header (80px) and ticker (~48px) */}
      <div className={hideCryptoTicker ? "pt-20" : "pt-32"}>
        {children}
      </div>

      {/* Newsletter Section */}
      <Newsletter />

      <footer className="border-t border-[#404055] text-[#a4a5b0] py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-6 sm:mb-0">
              <a href="/" className="text-[#68D08B] hover:text-[#5abc7a] transition-all duration-200 hover:translate-y-[-1px] font-medium text-center sm:text-left text-base">
                CryptoBonuses.com
              </a>
              <div className="flex items-center justify-center sm:justify-start gap-6 mt-4 sm:mt-0 text-sm">
                <a href="/privacy" className="text-[#a4a5b0] hover:text-[#68D08B] transition-all duration-200 hover:translate-y-[-1px]">
                  Privacy Policy
                </a>
                <a href="/terms" className="text-[#a4a5b0] hover:text-[#68D08B] transition-all duration-200 hover:translate-y-[-1px]">
                  Terms
                </a>
                <a href="/contact" className="text-[#a4a5b0] hover:text-[#68D08B] transition-all duration-200 hover:translate-y-[-1px]">
                  Contact
                </a>
              </div>
            </div>
            <div className="text-center sm:text-right opacity-70 text-xs">
              © {currentYear} CryptoBonuses. All rights reserved.
            </div>
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