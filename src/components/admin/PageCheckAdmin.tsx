'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface User {
  id: string;
  name: string | null;
  username: string | null;
  profilePicture: string | null;
  image: string | null;
}

interface PageCheck {
  id: string;
  pageSlug: string;
  pageType: string;
  notes: string | null;
  isAutomatic: boolean;
  createdAt: string;
  user: User;
}

interface Casino {
  id: string;
  name: string;
  slug: string;
}

export default function PageCheckAdmin() {
  const [pageChecks, setPageChecks] = useState<PageCheck[]>([]);
  const [casinos, setCasinos] = useState<Casino[]>([]);
  const [selectedCasinos, setSelectedCasinos] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pageChecksRes, casinosRes] = await Promise.all([
        fetch('/api/page-checks?limit=50'),
        fetch('/api/casinos')
      ]);

      if (pageChecksRes.ok) {
        const pageChecksData = await pageChecksRes.json();
        setPageChecks(pageChecksData.data || []);
      }

      if (casinosRes.ok) {
        const casinosData = await casinosRes.json();
        setCasinos(Array.isArray(casinosData) ? casinosData : []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSingleCheck = async (casinoSlug: string) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/page-checks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageSlug: casinoSlug,
          pageType: 'casino',
          notes: notes || null,
          isAutomatic: false,
        }),
      });

      if (response.ok) {
        await fetchData(); // Refresh the data
        setNotes('');
        alert('Page check recorded successfully');
      } else {
        alert('Failed to record page check');
      }
    } catch (error) {
      console.error('Error recording page check:', error);
      alert('Error recording page check');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkCheck = async () => {
    if (selectedCasinos.length === 0) {
      alert('Please select at least one casino');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/page-checks/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageSlugs: selectedCasinos,
          pageType: 'casino',
          notes: notes || null,
          isAutomatic: false,
        }),
      });

      if (response.ok) {
        // Clear selections and notes immediately
        setSelectedCasinos([]);
        setNotes('');
        alert(`Successfully recorded checks for ${selectedCasinos.length} casinos`);
        
        // Add a small delay before refreshing data to let the database settle
        setTimeout(() => {
          fetchData();
        }, 1000);
      } else {
        alert('Failed to record bulk page checks');
      }
    } catch (error) {
      console.error('Error recording bulk page checks:', error);
      alert('Error recording bulk page checks');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHomepageCheck = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/page-checks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageSlug: 'homepage',
          pageType: 'homepage',
          notes: notes || 'Homepage check - updates article modified time',
          isAutomatic: false,
        }),
      });

      if (response.ok) {
        await fetchData(); // Refresh the data
        setNotes('');
        alert('Homepage check recorded successfully - article modified time updated');
      } else {
        alert('Failed to record homepage check');
      }
    } catch (error) {
      console.error('Error recording homepage check:', error);
      alert('Error recording homepage check');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAllChecks = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ALL page checks? This will permanently remove ${pageChecks.length} page check records. This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(true);
    try {
      const response = await fetch('/api/page-checks', {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || 'All page checks deleted successfully');
        await fetchData(); // Refresh the data
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete page checks');
      }
    } catch (error) {
      console.error('Error deleting page checks:', error);
      alert('Error deleting page checks');
    } finally {
      setDeleting(false);
    }
  };

  const toggleCasinoSelection = (casinoSlug: string) => {
    setSelectedCasinos(prev => 
      prev.includes(casinoSlug)
        ? prev.filter(slug => slug !== casinoSlug)
        : [...prev, casinoSlug]
    );
  };

  const selectAllCasinos = () => {
    setSelectedCasinos(casinos.map(casino => casino.slug));
  };

  const clearSelection = () => {
    setSelectedCasinos([]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#68D08B]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Page Check Management</h1>
        <p className="text-[#a7a9b4]">
          Record page checks manually or schedule automatic weekly checks
        </p>
      </div>

      {/* Homepage Check Section */}
      <div className="bg-[#373946] rounded-lg p-6 border border-[#404055]">
        <h2 className="text-xl font-semibold text-white mb-4">Homepage Check</h2>
        <p className="text-[#a7a9b4] mb-4">
          Check the homepage to update its article modified time meta tag. This helps with SEO and social media sharing.
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#a7a9b4] mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this homepage check..."
            className="w-full px-3 py-2 bg-[#292932] border border-[#404055] rounded-md text-white placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#68D08B] focus:border-transparent"
            rows={2}
          />
        </div>

        <button
          onClick={handleHomepageCheck}
          disabled={submitting}
          className="px-6 py-2 bg-[#68D08B] text-white rounded-md hover:bg-[#5bc47d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {submitting ? 'Recording...' : 'Check Homepage'}
        </button>
      </div>

      {/* Bulk Check Section */}
      <div className="bg-[#373946] rounded-lg p-6 border border-[#404055]">
        <h2 className="text-xl font-semibold text-white mb-4">Bulk Page Check</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#a7a9b4] mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this check..."
            className="w-full px-3 py-2 bg-[#292932] border border-[#404055] rounded-md text-white placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#68D08B] focus:border-transparent"
            rows={3}
          />
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={selectAllCasinos}
            className="px-4 py-2 bg-[#68D08B] text-white rounded-md hover:bg-[#5bc47d] transition-colors"
          >
            Select All
          </button>
          <button
            onClick={clearSelection}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Clear Selection
          </button>
          <button
            onClick={handleBulkCheck}
            disabled={submitting || selectedCasinos.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Recording...' : `Check Selected (${selectedCasinos.length})`}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {casinos.map((casino) => (
            <div
              key={casino.id}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedCasinos.includes(casino.slug)
                  ? 'bg-[#68D08B]/20 border-[#68D08B]'
                  : 'bg-[#292932] border-[#404055] hover:border-[#68D08B]/50'
              }`}
              onClick={() => toggleCasinoSelection(casino.slug)}
            >
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">{casino.name}</span>
                <div className="flex gap-2">
                  {selectedCasinos.includes(casino.slug) && (
                    <div className="w-4 h-4 bg-[#68D08B] rounded-full flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSingleCheck(casino.slug);
                    }}
                    disabled={submitting}
                    className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    Check
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Checks */}
      <div className="bg-[#373946] rounded-lg p-6 border border-[#404055]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Page Checks</h2>
          {pageChecks.length > 0 && (
            <button
              onClick={handleDeleteAllChecks}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {deleting ? 'Deleting...' : `Delete All (${pageChecks.length})`}
            </button>
          )}
        </div>
        
        {pageChecks.length === 0 ? (
          <p className="text-[#a7a9b4]">No page checks recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {pageChecks.slice(0, 10).map((check) => (
              <div
                key={check.id}
                className="p-4 bg-[#292932] rounded-lg border border-[#404055]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {check.user.profilePicture || check.user.image ? (
                        <Image
                          src={check.user.profilePicture || check.user.image || ''}
                          alt={check.user.name || 'User'}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-[#68D08B] rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {(check.user.name || check.user.username || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        {check.user.username ? (
                          <Link 
                            href={`/user/${check.user.username}`}
                            className="text-white font-medium hover:text-[#68D08B] transition-colors duration-200"
                          >
                            {check.user.name || 'Unknown User'}
                          </Link>
                        ) : (
                          <span className="text-white font-medium">
                            {check.user.name || 'Unknown User'}
                          </span>
                        )}
                        <span className="text-[#a7a9b4]">checked</span>
                        <span className="text-[#68D08B] font-medium">
                          /{check.pageSlug}
                        </span>
                        {check.isAutomatic && (
                          <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded">
                            Auto
                          </span>
                        )}
                      </div>
                      {check.notes && (
                        <p className="text-[#a7a9b4] text-sm mt-1">{check.notes}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-[#a7a9b4] text-sm">
                    {formatDistanceToNow(new Date(check.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 