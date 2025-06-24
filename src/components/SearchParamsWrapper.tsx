"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

interface SearchParamsWrapperProps {
  onFilterChange: (filters: { bonusType?: string }) => void;
}

export default function SearchParamsWrapper({ onFilterChange }: SearchParamsWrapperProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;
    
    const filterParam = searchParams.get('filter');
    if (filterParam) {
      // Validate that the filter parameter is a valid bonus type
      const validBonusTypes = ['welcome', 'no_deposit', 'free_spins', 'reload', 'cashback', 'deposit', 'other'];
      if (validBonusTypes.includes(filterParam)) {
        onFilterChange({ bonusType: filterParam });
      }
    }
  }, [searchParams, onFilterChange]);

  return null; // This component doesn't render anything
} 