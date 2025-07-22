'use client';

import { TranslationProvider } from '@/contexts/TranslationContext';
import TranslatedConditionalLayout from '@/components/TranslatedConditionalLayout';
import React, { useState, useCallback, useEffect } from 'react';
import { FilterState, CasinoBonus } from '@/types/casino';
import CasinoCard from '@/components/CasinoCard';
import FilterControls from '@/components/FilterControls';
import StatisticsSection from '@/components/StatisticsSection';
import { Suspense } from 'react';
import SearchParamsWrapper from '@/components/SearchParamsWrapper';
import SchemaMarkup from '@/components/SchemaMarkup';
import { useTranslation } from '@/contexts/TranslationContext';

interface LanguageHomePageProps {
  language: string;
}

// Client-side homepage content
function TranslatedHomePage() {
  const { t } = useTranslation();
  
  const [bonuses, setBonuses] = useState<CasinoBonus[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);

  const currentYear = new Date().getFullYear();

  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    bonusType: '',
    casino: '',
    sortBy: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const statsResponse = await fetch('/api/statistics');
        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          setTotalUsers(stats.totalUsers || 0);
        }

        const response = await fetch('/api/casinos');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        const allBonuses = data.flatMap((casino: any) => 
          casino.bonuses.map((bonus: any) => ({
            id: bonus.id,
            casinoName: casino.name,
            bonusType: bonus.types[0] || 'other',
            bonusValue: parseFloat(bonus.value) || 0,
            bonusText: bonus.title,
            logoUrl: casino.logoUrl,
            promoCode: bonus.code || null,
            affiliateLink: casino.affiliateLink,
            isActive: true,
            reviews: []
          }))
        );
        
        setBonuses(allBonuses);
        setInitialized(true);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredBonuses = bonuses.filter(bonus => {
    if (filters.searchTerm && !bonus.casinoName.toLowerCase().includes(
      filters.searchTerm.toLowerCase()
    )) return false;
    
    if (filters.bonusType && bonus.bonusType !== filters.bonusType) return false;
    
    if (filters.casino && bonus.casinoName !== filters.casino) return false;
    
    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'newest') return 0; 
    if (filters.sortBy === 'oldest') return 0; 
    return 0; 
  });

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const handleUrlFilterChange = useCallback((urlFilters: Partial<FilterState>) => {
    setFilters(prev => ({
      ...prev,
      ...urlFilters
    }));
  }, []);

  const casinoNames = [...new Set(bonuses.map(bonus => bonus.casinoName))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#343541] text-white">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#68D08B] border-r-transparent"></div>
          <p className="mt-4">{t('homepage.loadingBonuses')}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#343541] text-white py-12">
      <Suspense fallback={null}>
        <SearchParamsWrapper onFilterChange={handleUrlFilterChange} />
      </Suspense>

      <SchemaMarkup 
        type="website" 
        data={{
          pageTitle: t('homepage.title'),
          pageDescription: t('homepage.description'),
          datePublished: '2024-01-01T00:00:00Z',
          dateModified: new Date().toISOString()
        }}
      />

      <SchemaMarkup type="brand" />

      <div className="mx-auto w-[90%] md:w-[95%] max-w-[1280px]">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-[#68D08B]/10 border border-[#68D08B]/20 rounded-full px-4 py-2 mb-6">
            <div className="w-2 h-2 bg-[#68D08B] rounded-full animate-pulse"></div>
            <span className="text-[#68D08B] text-sm font-medium">
              {currentYear} Edition
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-[#a4a5b0] bg-clip-text text-transparent leading-tight">
            {t('homepage.title')}
          </h1>
          
          <p className="text-[#a4a5b0] max-w-4xl mx-auto text-base sm:text-lg md:text-xl leading-relaxed mb-6 sm:mb-8">
            {t('homepage.description')}
          </p>
        </div>

        <div className="mb-8">
          <FilterControls
            key={`filter-controls-${initialized}`}
            filters={filters}
            onFilterChange={handleFilterChange}
            casinos={casinoNames}
            casinoCount={bonuses.length}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredBonuses.map(bonus => (
            <CasinoCard
              key={bonus.id}
              bonus={bonus}
            />
          ))}
          
          {filteredBonuses.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-[#a4a5b0] text-lg">
                {t('homepage.noMatchingBonuses')}
              </p>
            </div>
          )}
        </div>
      </div>

      <StatisticsSection />

      <div className="mx-auto w-[90%] md:w-[95%] max-w-[1280px]">
        <div className="mt-24 mb-16">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#68D08B]/10 border border-[#68D08B]/20 rounded-full px-6 py-3 mb-6">
              <div className="w-2 h-2 bg-[#68D08B] rounded-full animate-pulse"></div>
              <span className="text-[#68D08B] text-sm font-medium">
                {totalUsers >= 1000 ? `${Math.floor(totalUsers / 1000)}K+` : `${totalUsers}+`} Players Trusted
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 sm:mb-6 bg-gradient-to-r from-white to-[#a4a5b0] bg-clip-text text-transparent leading-tight py-2">
              {t('homepage.welcomeTitle')}
            </h2>
            
            <p className="text-[#a4a5b0] max-w-3xl mx-auto text-base sm:text-lg md:text-xl leading-relaxed mb-6 sm:mb-8">
              {t('homepage.welcomeDescription', { year: currentYear })}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 text-[#68D08B]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c.552 0 1-.448 1-1V8c0-.552-.448-1-1-1s-1 .448-1 1v3c0 .552.448 1 1 1z"/>
                  <path d="M3 12c-.552 0-1-.448-1-1V8c0-.552-.448-1 1-1s1 .448 1 1v3c0-.552-.448-1-1-1z"/>
                  <path d="M12 21c.552 0 1-.448 1-1v-3c0-.552-.448-1-1-1s-1 .448-1 1v3c0 .552.448 1 1 1z"/>
                  <path d="M12 3c-.552 0-1 .448-1 1v3c0 .552.448 1 1 1s1-.448 1-1V4c0-.552-.448-1-1-1z"/>
                </svg>
                <span className="text-sm font-medium">{t('homepage.verifiedBonuses')}</span>
              </div>
              <div className="flex items-center gap-2 text-[#68D08B]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
                <span className="text-sm font-medium">{t('homepage.exclusiveCodes')}</span>
              </div>
              <div className="flex items-center gap-2 text-[#68D08B]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                <span className="text-sm font-medium">{t('homepage.noHiddenFees')}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => {
                const filterSection = document.querySelector('[data-filter-section]');
                if (filterSection) {
                  filterSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-[#68D08B] hover:bg-[#5abc7a] text-[#343541] font-semibold px-8 py-3 rounded-lg transition-colors duration-300"
            >
              {t('homepage.viewAllBonuses')}
            </button>
            <a 
              href="/spin"
              className="bg-[#68D08B] hover:bg-[#5abc7a] text-[#343541] font-semibold px-8 py-3 rounded-lg transition-colors duration-300 inline-flex items-center gap-3 transform hover:scale-105 border-2 border-[#68D08B] hover:border-[#5abc7a]"
            >
              <span>{t('homepage.spinTheWheel')}</span>
              <div className="bg-black/10 rounded-full px-2 py-0.5 text-xs font-semibold">
                {t('homepage.winBig')}
              </div>
            </a>
            <button 
              onClick={() => {
                const filterSection = document.querySelector('[data-filter-section]');
                if (filterSection) {
                  filterSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="border border-[#68D08B] text-[#68D08B] hover:bg-[#68D08B] hover:text-[#343541] font-semibold px-8 py-3 rounded-lg transition-all duration-300"
            >
              {t('homepage.filterBonuses')}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

// Main language homepage wrapper
export function LanguageHomePage({ language }: LanguageHomePageProps) {
  return (
    <TranslationProvider locale={language as any}>
      <TranslatedConditionalLayout>
        <TranslatedHomePage />
      </TranslatedConditionalLayout>
    </TranslationProvider>
  );
} 