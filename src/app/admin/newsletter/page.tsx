"use client";

import { useState, useEffect } from 'react';

interface NewsletterSubscriber {
  id: string;
  email: string;
  status: 'SUBSCRIBED' | 'UNSUBSCRIBED';
  subscribedAt: string;
}

interface NewsletterData {
  totalSubscribers: number;
  subscribersThisMonth: number;
  subscribers: NewsletterSubscriber[];
}

export default function NewsletterAdminPage() {
  const [newsletterData, setNewsletterData] = useState<NewsletterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchNewsletterData();
  }, []);

  const fetchNewsletterData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/newsletter');
      if (response.ok) {
        const data = await response.json();
        setNewsletterData(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load newsletter data');
      }
    } catch (error) {
      console.error('Error fetching newsletter data:', error);
      setError('Failed to load newsletter data');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async () => {
    setExporting(true);
    try {
      const response = await fetch('/api/newsletter?format=csv');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        setError('Failed to export CSV');
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setError('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const filteredSubscribers = newsletterData?.subscribers.filter(subscriber =>
    subscriber.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Newsletter Management</h1>
        <div className="bg-[#292932] shadow-md rounded-lg p-6 border border-[#404055]">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-600 rounded w-1/4"></div>
            <div className="h-8 bg-gray-600 rounded"></div>
            <div className="h-32 bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Newsletter Management</h1>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
          <div className="flex items-center gap-2 text-red-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <span>{error}</span>
            <button 
              onClick={fetchNewsletterData}
              className="ml-2 text-sm underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-white mb-4 sm:mb-0">Newsletter Management</h1>
        <button
          onClick={exportCSV}
          disabled={exporting || !newsletterData?.subscribers?.length}
          className="px-4 py-2 bg-[#68D08B] hover:bg-[#7ee095] text-[#1a1a1a] font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
        >
          {exporting ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Exporting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Export CSV
            </>
          )}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#292932] shadow-md rounded-lg p-6 border border-[#404055]">
          <div className="flex items-center">
            <div className="p-3 bg-[#68D08B]/20 rounded-lg mr-4">
              <svg className="w-6 h-6 text-[#68D08B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <div>
              <p className="text-[#a7a9b4] text-sm font-medium">Total Subscribers</p>
              <p className="text-2xl font-bold text-white">{newsletterData?.totalSubscribers.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#292932] shadow-md rounded-lg p-6 border border-[#404055]">
          <div className="flex items-center">
            <div className="p-3 bg-[#68D08B]/20 rounded-lg mr-4">
              <svg className="w-6 h-6 text-[#68D08B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8V9m-2 8h4m6 0V9h2a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2h2z"/>
              </svg>
            </div>
            <div>
              <p className="text-[#a7a9b4] text-sm font-medium">This Month</p>
              <p className="text-2xl font-bold text-white">{newsletterData?.subscribersThisMonth.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Subscribers Table */}
      <div className="bg-[#292932] shadow-md rounded-lg border border-[#404055]">
        <div className="p-6 border-b border-[#404055]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-semibold text-white">Subscribers</h2>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8b8c98]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="text"
                placeholder="Search subscribers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#343541] border border-[#404055] rounded-lg text-white placeholder-[#8b8c98] focus:outline-none focus:ring-2 focus:ring-[#68D08B] focus:border-transparent w-full sm:w-64"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-[#404055]">
                <th className="px-6 py-3 text-left text-xs font-medium text-[#a7a9b4] uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#a7a9b4] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#a7a9b4] uppercase tracking-wider">Subscribed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#404055]">
              {filteredSubscribers.length > 0 ? (
                filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-[#373946] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{subscriber.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        subscriber.status === 'SUBSCRIBED' 
                          ? 'bg-[#68D08B]/20 text-[#68D08B]' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {subscriber.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#a7a9b4]">
                      {new Date(subscriber.subscribedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-[#a7a9b4]">
                    {searchTerm ? 'No subscribers found matching your search.' : 'No subscribers yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 