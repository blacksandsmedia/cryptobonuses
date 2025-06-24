'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { trackSearch, trackSearchInstant } from '@/utils/searchTracking';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  type: 'casino' | 'bonus';
  description?: string;
  casinoName?: string;
  bonusCode?: string;
  bonusValue?: string;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isOpen) return;
      
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      // Add a small delay to prevent immediate closing when the modal opens
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        }
        // Removed search results page navigation since it doesn't exist
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, results, searchTerm]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setResults([]);
      setSelectedIndex(-1);
      setLoading(false);
    }
  }, [isOpen]);

  // Search function with debounced API call
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setSelectedIndex(-1);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
          setSelectedIndex(-1);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchTerm]);

  // Track search when typing (debounced)
  useEffect(() => {
    if (searchTerm.trim()) {
      trackSearch(searchTerm);
    }
  }, [searchTerm]);

  const handleResultClick = (result: SearchResult) => {
    trackSearchInstant(searchTerm);
    router.push(`/${result.slug}`);
    onClose();
  };



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className="bg-[#3e4050] rounded-xl shadow-2xl border border-[#404055] w-full max-w-2xl max-h-[80vh] overflow-hidden relative z-10"
      >
          {/* Search Header */}
          <div className="p-6 border-b border-[#404055]">
            <div className="flex items-center gap-4">
              <svg className="w-6 h-6 text-[#a4a5b0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search casinos, bonuses, or codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent text-white text-lg placeholder-[#a4a5b0] focus:outline-none"
              />
              <button
                onClick={onClose}
                className="text-[#a4a5b0] hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Search Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {loading && (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#68D08B] mx-auto mb-3"></div>
                <p className="text-[#a4a5b0]">Searching...</p>
              </div>
            )}

            {!loading && searchTerm && results.length === 0 && (
              <div className="p-6 text-center">
                <p className="text-[#a4a5b0] mb-2">No casinos, bonuses, or codes found</p>
                <p className="text-[#a4a5b0]/70 text-sm mb-4">Try searching for different keywords or casino names</p>
                <Link
                  href="/"
                  onClick={onClose}
                  className="text-[#68D08B] hover:text-[#5abc7a] font-medium"
                >
                  Return to home →
                </Link>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="py-2">
                {results.map((result, index) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className={`w-full p-4 flex items-center gap-4 hover:bg-[#434555] transition-colors text-left ${
                      index === selectedIndex ? 'bg-[#434555]' : ''
                    }`}
                  >
                    {result.logo ? (
                      <Image
                        src={result.logo}
                        alt={result.type === 'bonus' ? result.casinoName || 'Casino' : result.name}
                        width={40}
                        height={40}
                        className="rounded-md flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-[#2c2f3a] rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold">
                          {(result.type === 'bonus' ? result.casinoName || result.name : result.name).charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-1">{result.name}</h3>
                      <p className="text-[#a4a5b0] text-sm line-clamp-1">
                        {result.type === 'bonus' 
                          ? result.description || `${result.bonusValue} from ${result.casinoName}`
                          : result.description || `Unlock live bonus offers for ${result.name}, see other player's ratings & more.`
                        }
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-[#a4a5b0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            )}

            {!searchTerm && (
              <div className="p-6 text-center">
                <div className="text-[#a4a5b0] mb-4">
                  <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p>Start typing to search casinos, bonuses, and codes</p>
                </div>
                <div className="text-xs text-[#a4a5b0]/70 space-y-1">
                  <p>Try searching for: casino names, bonus codes, or offer types</p>
                  <p>Press <kbd className="px-2 py-1 bg-[#2c2f3a] rounded border border-[#404055]">Esc</kbd> to close</p>
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
  );
} 