'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SearchData {
  id: string;
  searchTerm: string;
  createdAt: string;
  path: string;
}

interface SearchStats {
  totalSearches: number;
  uniqueTerms: number;
  topSearches: Array<{ term: string; count: number }>;
  recentSearches: SearchData[];
}

export default function SearchAnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchStats, setSearchStats] = useState<SearchStats | null>(null);
  const [timeframe, setTimeframe] = useState('7d'); // 24h, 7d, 30d, all
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    // Only fetch data after auth has been checked successfully
    if (authChecked) {
      fetchSearchData();
    }
  }, [timeframe, authChecked]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin-auth');
      if (response.ok) {
        const userData = await response.json();
        if (userData.success && userData.user) {
          setAuthChecked(true);
          fetchSearchData();
        } else {
          router.push('/admin/login');
        }
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/admin/login');
    }
  };

  const fetchSearchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/search-analytics?timeframe=${timeframe}`);
      
      if (response.ok) {
        const data = await response.json();
        setSearchStats(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch search data');
      }
    } catch (error) {
      console.error('Error fetching search data:', error);
      setError('Failed to fetch search data');
    } finally {
      setLoading(false);
    }
  };

  const filteredSearches = searchStats?.recentSearches.filter(search => 
    searchTerm === '' || search.searchTerm.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const formatTimeframe = (tf: string) => {
    switch (tf) {
      case '24h': return 'Last 24 Hours';
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case 'all': return 'All Time';
      default: return 'Last 7 Days';
    }
  };

  const deleteAllSearchData = async () => {
    if (!confirm('Are you sure you want to delete ALL search data? This action cannot be undone.')) {
      return;
    }
    
    if (!confirm('This will permanently delete all search analytics data. Are you absolutely sure?')) {
      return;
    }
    
    try {
      setIsDeleting(true);
      setError(null);
      
      const response = await fetch('/api/admin/search-analytics', {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Refresh data after deletion
        await fetchSearchData();
        alert('All search data has been deleted successfully.');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete search data');
      }
    } catch (error) {
      console.error('Error deleting search data:', error);
      setError('An error occurred while deleting search data');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#343541] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#68D08B] mx-auto mb-4"></div>
          <p>Loading search analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#343541] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">Error</div>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={fetchSearchData}
            className="mt-4 px-4 py-2 bg-[#68D08B] text-white rounded-lg hover:bg-[#5ab373] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#343541] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Search Analytics</h1>
            <p className="text-gray-400">Monitor user search behavior and popular terms</p>
          </div>
          
          <div className="flex gap-3">
            {/* Timeframe Selector */}
            <div className="flex gap-2">
              {['24h', '7d', '30d', 'all'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeframe === tf
                      ? 'bg-[#68D08B] text-white'
                      : 'bg-[#3e4050] text-gray-300 hover:bg-[#4a4b5c]'
                  }`}
                >
                  {formatTimeframe(tf)}
                </button>
              ))}
            </div>
            
            {/* Delete Button */}
            <button
              onClick={deleteAllSearchData}
              disabled={isDeleting || !searchStats || searchStats.totalSearches === 0}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete All Data
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#3e4050] rounded-xl p-6 border border-[#404055]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Searches</p>
                <p className="text-2xl font-bold text-white">
                  {searchStats?.totalSearches.toLocaleString() || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-[#68D08B]/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#68D08B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-[#3e4050] rounded-xl p-6 border border-[#404055]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Unique Terms</p>
                <p className="text-2xl font-bold text-white">
                  {searchStats?.uniqueTerms.toLocaleString() || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-[#3e4050] rounded-xl p-6 border border-[#404055]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg. per Day</p>
                <p className="text-2xl font-bold text-white">
                  {searchStats ? Math.round(searchStats.totalSearches / (timeframe === '24h' ? 1 : timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 365)).toLocaleString() : 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Top Search Terms */}
          <div className="bg-[#3e4050] rounded-xl border border-[#404055]">
            <div className="p-6 border-b border-[#404055]">
              <h2 className="text-xl font-semibold">Top Search Terms</h2>
              <p className="text-gray-400 text-sm">Most popular search queries</p>
            </div>
            <div className="p-6">
              {searchStats?.topSearches && searchStats.topSearches.length > 0 ? (
                <div className="space-y-4">
                  {searchStats.topSearches.slice(0, 10).map((search, index) => (
                    <div key={search.term} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#68D08B]/20 rounded-lg flex items-center justify-center text-[#68D08B] font-bold text-sm">
                          {index + 1}
                        </div>
                        <span className="text-white font-medium">{search.term}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">{search.count} searches</span>
                        <div className="w-20 h-2 bg-[#404055] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#68D08B] rounded-full transition-all duration-300"
                            style={{ 
                              width: `${(search.count / (searchStats?.topSearches[0]?.count || 1)) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No search data available for this timeframe</p>
              )}
            </div>
          </div>

          {/* Recent Searches */}
          <div className="bg-[#3e4050] rounded-xl border border-[#404055]">
            <div className="p-6 border-b border-[#404055]">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">Recent Searches</h2>
                  <p className="text-gray-400 text-sm">Latest search activity</p>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Filter searches..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-[#2c2f3a] border border-[#404055] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#68D08B] focus:border-transparent text-sm w-48"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              {filteredSearches.length > 0 ? (
                <div className="space-y-3">
                  {filteredSearches.slice(0, 20).map((search) => (
                    <div key={search.id} className="flex items-center justify-between p-3 bg-[#2c2f3a] rounded-lg">
                      <div>
                        <p className="text-white font-medium">{search.searchTerm}</p>
                        <p className="text-gray-400 text-xs">{search.path || 'Homepage'}</p>
                      </div>
                      <div className="text-gray-400 text-xs">
                        {new Date(search.createdAt).toLocaleDateString()} {new Date(search.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  {searchTerm ? 'No searches match your filter' : 'No recent searches available'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 