'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { FilterState } from '@/types/casino';
import CasinoCard from '@/components/CasinoCard';
import FilterControls from '@/components/FilterControls';
import StatisticsSection from '@/components/StatisticsSection';
import Image from 'next/image';
import Script from 'next/script';
import { Suspense } from 'react';
import SearchParamsWrapper from '@/components/SearchParamsWrapper';
import SchemaMarkup from '@/components/SchemaMarkup';

// Define the types for our data
interface Bonus {
  id: string;
  title: string;
  description: string;
  code: string | null;
  type?: string; // Old field for backward compatibility
  types: string[]; // New array field
  value: string;
}

interface Casino {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string;
  rating: number;
  displayOrder: number;
  affiliateLink: string | null;
  bonuses: Bonus[];
  createdAt: string;
  codeTermLabel?: string;
}

// Transform the database data into the format expected by the UI
// Only show one card per casino, using the first bonus for each casino
// Casinos are already sorted by displayOrder from the API
const transformCasinoDataForUI = (casinos: Casino[]) => {
  if (casinos.length === 0) {
    return [];
  }
  
  return casinos.map(casino => {
    // Use the first bonus or create a placeholder if no bonuses
    const bonus = casino.bonuses.length > 0 ? casino.bonuses[0] : {
      id: 'placeholder',
      title: 'No bonus available',
      description: 'No bonus available',
      code: null,
      types: ['WELCOME'],
      value: '0'
    };
    
    // Handle both old 'type' field and new 'types' array
    let bonusType = 'welcome';
    let bonusTypes = ['welcome'];
    if (bonus.types && bonus.types.length > 0) {
      bonusTypes = bonus.types.map((type: string) => type.toLowerCase());
      bonusType = bonusTypes[0]; // First type for backward compatibility
    } else if (bonus.type) {
      bonusType = bonus.type.toLowerCase();
      bonusTypes = [bonusType];
    }
    
    // Clean up the logo URL
    const logoUrl = casino.logo || '';
    
    const transformedCasino = {
      id: casino.slug,
      casinoName: casino.name,
      bonusType: bonusType,
      bonusTypes: bonusTypes, // New field with all types
      bonusValue: parseFloat(bonus.value) || 0,
      bonusText: bonus.title,
      logoUrl: logoUrl,
      promoCode: bonus.code,
      affiliateLink: casino.affiliateLink || '',
      isActive: true,
      // Add the casino ID for tracking usage
      casinoId: casino.id,
      // Add the bonus ID for tracking usage
      bonusId: bonus.id,
      // Add the casino-specific code term label
      codeTermLabel: casino.codeTermLabel || 'bonus code'
    };
    
    return transformedCasino;
  });
};

export default function Home() {
  // Initialize state with useEffect to avoid hydration errors
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [codeTermLabel, setCodeTermLabel] = useState('bonus code');
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    bonusType: '',
    casino: '',
    sortBy: ''
  });
  const [casinos, setCasinos] = useState<Casino[]>([]);
  const [filteredBonuses, setFilteredBonuses] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(50000); // Default fallback
  // State for trending data
  const [trendingData, setTrendingData] = useState<Map<string, number>>(new Map());

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const settings = await response.json();
          setCodeTermLabel(settings.codeTermLabel || 'bonus code');
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  // Calculate plural form of code term label
  const pluralCodeTermLabel = codeTermLabel.endsWith('e') ? `${codeTermLabel}s` : `${codeTermLabel}s`;

  // Handle filter changes from URL parameters
  const handleUrlFilterChange = useCallback((newFilters: { bonusType?: string }) => {
    setFilters(prev => ({ 
      ...prev, 
      bonusType: newFilters.bonusType as FilterState['bonusType'] || prev.bonusType
    }));
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Fetch casinos data and statistics
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch casinos
        const casinosResponse = await fetch('/api/casinos');
        if (!casinosResponse.ok) throw new Error('Failed to fetch casinos');
        const casinosData = await casinosResponse.json();
        
        setCasinos(casinosData);

        // Fetch trending data (usage statistics for the past week)
        try {
          const trendingResponse = await fetch('/api/analytics');
          if (trendingResponse.ok) {
            const analyticsData = await trendingResponse.json();
            
            // Create a map of casino ID to total actions in the past week
            const trendsMap = new Map<string, number>();
            
            if (analyticsData.casinoAnalytics) {
              analyticsData.casinoAnalytics.forEach((casino: any) => {
                // Sum up all actions (copies + clicks) for trending score
                const totalActions = casino.copies + casino.clicks;
                trendsMap.set(casino.id, totalActions);
              });
            }
            
            setTrendingData(trendsMap);
          }
        } catch (trendingError) {
          console.error('Error fetching trending data:', trendingError);
        }

        // Fetch statistics for total users
        try {
          const statsResponse = await fetch('/api/statistics');
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setTotalUsers(statsData.totalUsers || 50000);
          }
        } catch (statsError) {
          console.error('Error fetching statistics:', statsError);
          // Keep default fallback value
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    fetchData();
  }, []);

  // Apply filters whenever the filters state changes
  useEffect(() => {
    if (!initialized) return;
    
    // Generate one card per casino (not per bonus)
    const bonusesData = transformCasinoDataForUI(casinos);
    
    const result = bonusesData
      .filter(bonus => {
        if (filters.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase();
          return (
            bonus.casinoName.toLowerCase().includes(searchLower) ||
            bonus.bonusText.toLowerCase().includes(searchLower) ||
            (bonus.promoCode && bonus.promoCode.toLowerCase().includes(searchLower))
          );
        }
        return true;
      })
      .filter(bonus => {
        if (!filters.bonusType) return true;
        // Check if the selected type exists in the bonusTypes array
        return bonus.bonusTypes && bonus.bonusTypes.includes(filters.bonusType);
      })
      .filter(bonus => {
        if (!filters.casino) return true;
        return bonus.casinoName.toLowerCase() === filters.casino.toLowerCase();
      })
      .sort((a, b) => {
        if (!filters.sortBy) {
          // Default sort: use displayOrder from backend
          const casinoA = casinos.find(c => c.id === a.casinoId);
          const casinoB = casinos.find(c => c.id === b.casinoId);
          return (casinoA?.displayOrder || 0) - (casinoB?.displayOrder || 0);
        }
        
        if (filters.sortBy === 'newest') {
          // Sort by creation date (newest first)
          const casinoA = casinos.find(c => c.id === a.casinoId);
          const casinoB = casinos.find(c => c.id === b.casinoId);
          const dateA = new Date(casinoA?.createdAt || 0).getTime();
          const dateB = new Date(casinoB?.createdAt || 0).getTime();
          return dateB - dateA;
        }
        
        if (filters.sortBy === 'highest_rated') {
          // Sort by rating (highest first)
          const casinoA = casinos.find(c => c.id === a.casinoId);
          const casinoB = casinos.find(c => c.id === b.casinoId);
          return (casinoB?.rating || 0) - (casinoA?.rating || 0);
        }
        
        if (filters.sortBy === 'trending') {
          // Sort by trending (most used offers first)
          const trendingA = trendingData.get(a.casinoId || '') || 0;
          const trendingB = trendingData.get(b.casinoId || '') || 0;
          return trendingB - trendingA;
        }
        
        return 0;
      });
    
    // Ensure we're actually updating the state with the filtered results
    setFilteredBonuses(result);
  }, [filters, initialized, casinos, trendingData]);

  // Get unique casino names for filter dropdown
  const casinoNames = Array.from(new Set(casinos.map(casino => casino.name))).sort();

  const currentYear = new Date().getFullYear();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#343541] text-white">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#68D08B] border-r-transparent"></div>
          <p className="mt-4">Loading casino bonuses...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#343541] text-white py-12">
      {/* Search params wrapper with Suspense */}
      <Suspense fallback={null}>
        <SearchParamsWrapper onFilterChange={handleUrlFilterChange} />
      </Suspense>

      {/* Enhanced Schema Markup for Homepage */}
      <SchemaMarkup 
        type="website" 
        data={{
          pageTitle: `CryptoBonuses - Best Bitcoin Casino Bonuses ${currentYear}`,
          pageDescription: `Discover the best Bitcoin casino bonuses and promotional offers in ${currentYear}. Our expertly curated list includes trusted crypto casinos offering generous welcome packages, exclusive bonus codes, and free spins.`
        }}
      />

      <div className="mx-auto w-[95%] md:w-[95%] max-w-[1280px]">
        <h1 className="text-2xl md:text-4xl font-semibold text-center mt-2 mb-12">
          Bitcoin Casino Bonuses {currentYear}
        </h1>
        
        <div className="mb-12" data-filter-section>
          <FilterControls
            key={`filter-controls-${initialized}`}
            filters={filters}
            onFilterChange={handleFilterChange}
            casinos={casinoNames}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBonuses.map(bonus => (
            <CasinoCard
              key={`${bonus.id}`}
              bonus={bonus}
            />
          ))}
          
          {filteredBonuses.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-[#a4a5b0] text-lg">
                No bonuses found matching your filters. Try changing your filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Section */}
      <StatisticsSection />

      <div className="mx-auto w-[95%] md:w-[95%] max-w-[1280px]">
        <div className="mt-24 mb-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#68D08B]/10 border border-[#68D08B]/20 rounded-full px-6 py-3 mb-6">
              <div className="w-2 h-2 bg-[#68D08B] rounded-full animate-pulse"></div>
              <span className="text-[#68D08B] text-sm font-medium">
                Trusted by {totalUsers >= 1000 ? `${Math.floor(totalUsers / 1000)}K+` : `${totalUsers}+`} Players
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-semibold mb-6 bg-gradient-to-r from-white to-[#a4a5b0] bg-clip-text text-transparent leading-tight py-2">
              Welcome to CryptoBonuses
            </h2>
            
            <p className="text-[#a4a5b0] max-w-3xl mx-auto text-lg md:text-xl leading-relaxed mb-8">
              Discover the best Bitcoin casino bonuses and promotional bonuses in {currentYear}. Our expertly curated list includes trusted crypto casinos offering generous welcome packages, exclusive bonus codes, and free spins.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 text-[#68D08B]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c.552 0 1-.448 1-1V8c0-.552-.448-1-1-1s-1 .448-1 1v3c0 .552.448 1 1 1z"/>
                  <path d="M3 12c-.552 0-1-.448-1-1V8c0-.552.448-1 1-1s1 .448 1 1v3c0-.552-.448-1-1-1z"/>
                  <path d="M12 21c.552 0 1-.448 1-1v-3c0-.552-.448-1-1-1s-1 .448-1 1v3c0 .552.448 1 1 1z"/>
                  <path d="M12 3c-.552 0-1 .448-1 1v3c0 .552.448 1 1 1s1-.448 1-1V4c0-.552-.448-1-1-1z"/>
                </svg>
                <span className="text-sm font-medium">Verified Bonuses</span>
              </div>
              <div className="flex items-center gap-2 text-[#68D08B]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
                <span className="text-sm font-medium">Exclusive Codes</span>
              </div>
              <div className="flex items-center gap-2 text-[#68D08B]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                <span className="text-sm font-medium">No Hidden Fees</span>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#3e4050] rounded-xl p-6 border border-[#404055] hover:border-[#68D08B]/30 transition-all duration-300">
              <div className="w-12 h-12 bg-[#68D08B]/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#68D08B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="m22 21-3-3m0 0a5.5 5.5 0 1 0-7.8-7.8 5.5 5.5 0 0 0 7.8 7.8Z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Reviews</h3>
              <p className="text-[#a4a5b0] text-sm leading-relaxed">
                Our team thoroughly tests each casino and bonus offer to ensure you get the best deals with fair terms and conditions.
              </p>
            </div>

            <div className="bg-[#3e4050] rounded-xl p-6 border border-[#404055] hover:border-[#68D08B]/30 transition-all duration-300">
              <div className="w-12 h-12 bg-[#68D08B]/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#68D08B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Exclusive Offers</h3>
              <p className="text-[#a4a5b0] text-sm leading-relaxed">
                Access special {pluralCodeTermLabel} and enhanced bonuses that you won't find anywhere else, negotiated exclusively for our users.
              </p>
            </div>

            <div className="bg-[#3e4050] rounded-xl p-6 border border-[#404055] hover:border-[#68D08B]/30 transition-all duration-300">
              <div className="w-12 h-12 bg-[#68D08B]/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#68D08B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4"/>
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Always Updated</h3>
              <p className="text-[#a4a5b0] text-sm leading-relaxed">
                Our bonus database is updated daily to ensure all offers are current, active, and provide the maximum value to players.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <p className="text-[#a4a5b0] mb-6">
              Ready to claim your bonus? Browse our top-rated crypto casinos above, spin the wheel for a surprise, or start playing today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-[#68D08B] hover:bg-[#5abc7a] text-[#343541] font-semibold px-8 py-3 rounded-lg transition-colors duration-300"
              >
                View All Bonuses
              </button>
              <a 
                href="/spin"
                className="bg-[#68D08B] hover:bg-[#5abc7a] text-[#343541] font-semibold px-8 py-3 rounded-lg transition-colors duration-300 inline-flex items-center gap-3 transform hover:scale-105 border-2 border-[#68D08B] hover:border-[#5abc7a]"
              >
                <span>Spin the Wheel</span>
                <div className="bg-black/10 rounded-full px-2 py-0.5 text-xs font-semibold">
                  WIN BIG!
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
                Filter Bonuses
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 