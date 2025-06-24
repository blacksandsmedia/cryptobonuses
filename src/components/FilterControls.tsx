import React, { useEffect, useRef } from 'react';
import { BonusType, FilterState } from '@/types/casino';
import { trackSearch, trackSearchInstant } from '@/utils/searchTracking';

interface FilterControlsProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  casinos: string[];
  className?: string;
}

export default function FilterControls({ filters, onFilterChange, casinos, className = '' }: FilterControlsProps) {
  const searchInputDesktopRef = useRef<HTMLInputElement>(null);
  const searchInputMobileRef = useRef<HTMLInputElement>(null);

  // Track search terms with debouncing
  useEffect(() => {
    if (filters.searchTerm) {
      trackSearch(filters.searchTerm);
    }
  }, [filters.searchTerm]);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    onFilterChange({ searchTerm: value });
  };

  // Handle instant tracking on click/focus events
  const handleSearchInteraction = (searchTerm: string) => {
    if (searchTerm.trim()) {
      trackSearchInstant(searchTerm);
    }
  };

  // Handle scroll events for instant tracking
  useEffect(() => {
    const handleScroll = () => {
      if (filters.searchTerm.trim()) {
        trackSearchInstant(filters.searchTerm);
      }
    };

    // Add scroll listener with throttling
    let scrollTimeout: NodeJS.Timeout;
    const throttledScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 1000); // Track after 1 second of scroll inactivity
    };

    window.addEventListener('scroll', throttledScroll);
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      clearTimeout(scrollTimeout);
    };
  }, [filters.searchTerm]);

  const dropdownStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238b8c98'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
    backgroundSize: '18px'
  };

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      {/* Desktop view - horizontal layout */}
      <div className="hidden sm:flex gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" 
              className="w-5 h-5 text-[#8b8c98]">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            ref={searchInputDesktopRef}
            type="search"
            placeholder="Search bonuses..."
            value={filters.searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onClick={() => handleSearchInteraction(filters.searchTerm)}
            onFocus={() => handleSearchInteraction(filters.searchTerm)}
            className="w-full pl-12 pr-4 h-12 bg-[#2c2f3a] border-2 border-[#404055] rounded-xl text-white placeholder-[#8b8c98] focus:outline-none focus:ring-1 focus:ring-[#68D08B] transition-all"
          />
        </div>

        {/* Type Dropdown */}
        <select
          value={filters.bonusType}
          onChange={(e) => onFilterChange({ bonusType: e.target.value as BonusType | '' })}
          className="h-12 px-4 bg-[#2c2f3a] border-2 border-[#404055] rounded-xl text-[#8b8c98] focus:outline-none focus:ring-1 focus:ring-[#68D08B] transition-all appearance-none pr-12 min-w-[160px]"
          style={dropdownStyle}
        >
          <option value="">All Types</option>
          <option value="welcome">Welcome</option>
          <option value="no_deposit">No Deposit</option>
          <option value="free_spins">Free Spins</option>
          <option value="reload">Reload</option>
          <option value="cashback">Cashback</option>
          <option value="deposit">Deposit</option>
        </select>

        {/* Sort Dropdown */}
        <select
          value={filters.sortBy}
          onChange={(e) => onFilterChange({ sortBy: e.target.value as FilterState['sortBy'] })}
          className="h-12 px-4 bg-[#2c2f3a] border-2 border-[#404055] rounded-xl text-[#8b8c98] focus:outline-none focus:ring-1 focus:ring-[#68D08B] transition-all appearance-none pr-12 min-w-[160px]"
          style={dropdownStyle}
        >
          <option value="">Default</option>
          <option value="newest">Newest</option>
          <option value="highest_rated">Highest Rated</option>
          <option value="trending">Trending</option>
        </select>
      </div>

      {/* Mobile view - vertical layout */}
      <div className="sm:hidden flex flex-col gap-3">
        {/* Search Bar - Full width on mobile */}
        <div className="w-full">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" 
                className="w-5 h-5 text-[#8b8c98]">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              ref={searchInputMobileRef}
              type="search"
              placeholder="Search bonuses..."
              value={filters.searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onClick={() => handleSearchInteraction(filters.searchTerm)}
              onFocus={() => handleSearchInteraction(filters.searchTerm)}
              className="w-full pl-12 pr-4 h-12 bg-[#2c2f3a] border-2 border-[#404055] rounded-xl text-white placeholder-[#8b8c98] focus:outline-none focus:ring-1 focus:ring-[#68D08B] transition-all"
            />
          </div>
        </div>

        {/* Filter Controls - Row on desktop, stack on mobile */}
        <div className="flex flex-col gap-3">
          {/* Type Dropdown */}
          <select
            value={filters.bonusType}
            onChange={(e) => onFilterChange({ bonusType: e.target.value as BonusType | '' })}
            className="h-12 px-4 bg-[#2c2f3a] border-2 border-[#404055] rounded-xl text-[#8b8c98] focus:outline-none focus:ring-1 focus:ring-[#68D08B] transition-all appearance-none pr-12 w-full"
            style={dropdownStyle}
          >
            <option value="">All Types</option>
            <option value="welcome">Welcome</option>
            <option value="no_deposit">No Deposit</option>
            <option value="free_spins">Free Spins</option>
            <option value="reload">Reload</option>
            <option value="cashback">Cashback</option>
            <option value="deposit">Deposit</option>
          </select>

          {/* Sort Dropdown */}
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as FilterState['sortBy'] })}
            className="h-12 px-4 bg-[#2c2f3a] border-2 border-[#404055] rounded-xl text-[#8b8c98] focus:outline-none focus:ring-1 focus:ring-[#68D08B] transition-all appearance-none pr-12 w-full"
            style={dropdownStyle}
          >
            <option value="">Default</option>
            <option value="newest">Newest</option>
            <option value="highest_rated">Highest Rated</option>
            <option value="trending">Trending</option>
          </select>
        </div>
      </div>
    </div>
  );
} 