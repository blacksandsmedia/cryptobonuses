'use client';

import { useEffect, useState } from 'react';

interface SlugRedirect {
  id: string;
  oldSlug: string;
  newSlug: string;
  entityType: string;
  createdAt: string;
  updatedAt: string;
}

export default function RedirectsPage() {
  const [redirects, setRedirects] = useState<SlugRedirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    oldSlug: '',
    newSlug: '',
    entityType: 'casino'
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchRedirects();
  }, []);

  const fetchRedirects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/redirects');
      if (!response.ok) {
        throw new Error('Failed to fetch redirects');
      }
      const data = await response.json();
      setRedirects(data.redirects);
    } catch (err) {
      setError('Failed to load redirects');
      console.error('Error fetching redirects:', err);
    } finally {
      setLoading(false);
    }
  };

  const createRedirect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.oldSlug.trim() || !formData.newSlug.trim()) {
      alert('Please fill in both old and new slug fields');
      return;
    }

    // Remove leading slashes and clean up
    const cleanOldSlug = formData.oldSlug.replace(/^\/+/, '').trim();
    const cleanNewSlug = formData.newSlug.replace(/^\/+/, '').trim();

    if (cleanOldSlug === cleanNewSlug) {
      alert('Old and new slugs cannot be the same');
      return;
    }

    try {
      setFormLoading(true);
      const response = await fetch('/api/redirects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          oldSlug: cleanOldSlug,
          newSlug: cleanNewSlug,
          entityType: formData.entityType
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create redirect');
      }

      const data = await response.json();
      
      // Reset form and hide it
      setFormData({ oldSlug: '', newSlug: '', entityType: 'casino' });
      setShowAddForm(false);
      
      // Refresh the list
      fetchRedirects();
      
      // Show success message
      alert(data.updated ? 'Redirect updated successfully!' : 'Redirect created successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to create redirect');
      console.error('Error creating redirect:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const deleteRedirect = async (oldSlug: string) => {
    if (!confirm(`Are you sure you want to delete the redirect from "${oldSlug}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/redirects?oldSlug=${encodeURIComponent(oldSlug)}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete redirect');
      }

      // Refresh the list
      fetchRedirects();
    } catch (err) {
      alert('Failed to delete redirect');
      console.error('Error deleting redirect:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="admin-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="admin-heading">URL Redirects</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            {redirects.length} redirect{redirects.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-[#68D08B] to-[#5abc7a] hover:from-[#5abc7a] hover:to-[#4da968] text-[#343541] font-semibold px-4 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl border border-[#68D08B]/20"
          >
            {showAddForm ? 'Cancel' : 'Add Redirect'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500 text-white p-3 rounded-md flex items-center">
          {error}
        </div>
      )}

      {/* Add Redirect Form */}
      {showAddForm && (
        <div className="admin-container">
          <h3 className="text-lg font-semibold mb-4">Add New Redirect</h3>
          <form onSubmit={createRedirect} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="oldSlug" className="block text-sm font-medium mb-2">
                  From (Old URL)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">/</span>
                  <input
                    type="text"
                    id="oldSlug"
                    value={formData.oldSlug}
                    onChange={(e) => setFormData(prev => ({ ...prev, oldSlug: e.target.value }))}
                    className="w-full pl-8 pr-3 py-2 bg-[#1E1E27] border border-[#404055] rounded-lg text-white placeholder-gray-400"
                    placeholder="old-casino-slug"
                    required
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Enter the old URL path that should redirect</p>
              </div>

              <div>
                <label htmlFor="newSlug" className="block text-sm font-medium mb-2">
                  To (New URL)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">/</span>
                  <input
                    type="text"
                    id="newSlug"
                    value={formData.newSlug}
                    onChange={(e) => setFormData(prev => ({ ...prev, newSlug: e.target.value }))}
                    className="w-full pl-8 pr-3 py-2 bg-[#1E1E27] border border-[#404055] rounded-lg text-white placeholder-gray-400"
                    placeholder="new-casino-slug"
                    required
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Enter the new URL path to redirect to</p>
              </div>
            </div>

            <div>
              <label htmlFor="entityType" className="block text-sm font-medium mb-2">
                Type
              </label>
              <select
                id="entityType"
                value={formData.entityType}
                onChange={(e) => setFormData(prev => ({ ...prev, entityType: e.target.value }))}
                className="w-full px-3 py-2 bg-[#1E1E27] border border-[#404055] rounded-lg text-white"
              >
                <option value="casino">Casino</option>
                <option value="bonus">Bonus</option>
                <option value="page">Page</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={formLoading}
                className="bg-gradient-to-r from-[#68D08B] to-[#5abc7a] hover:from-[#5abc7a] hover:to-[#4da968] disabled:from-[#68D08B]/50 disabled:to-[#5abc7a]/50 text-[#343541] font-semibold px-6 py-2 rounded-lg transition-all duration-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl border border-[#68D08B]/20"
              >
                {formLoading ? 'Creating...' : 'Create Redirect'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ oldSlug: '', newSlug: '', entityType: 'casino' });
                }}
                className="bg-[#343541] border border-[#404055] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#383b4a] hover:border-[#68D08B]/30 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-container">
        <div className="mb-4">
          <p className="text-sm text-gray-400">
            Manage 301 redirects for your site. Create manual redirects for any URL changes, or view 
            automatically created redirects when casino slugs are changed to preserve SEO.
          </p>
        </div>

        {redirects.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No redirects found.</p>
            <p className="text-sm mt-2">
              Click "Add Redirect" to create your first manual redirect, or redirects will be 
              automatically created when casino slugs are changed.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#404055]">
                  <th className="text-left py-3 px-4 font-semibold">From URL</th>
                  <th className="text-left py-3 px-4 font-semibold">To URL</th>
                  <th className="text-left py-3 px-4 font-semibold">Type</th>
                  <th className="text-left py-3 px-4 font-semibold">Created</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {redirects.map((redirect) => (
                  <tr key={redirect.id} className="border-b border-[#2A2B37] hover:bg-[#2A2B37]">
                    <td className="py-3 px-4">
                      <code className="bg-[#1E1E27] px-2 py-1 rounded text-sm">
                        /{redirect.oldSlug}
                      </code>
                    </td>
                    <td className="py-3 px-4">
                      <a 
                        href={`/${redirect.newSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#68D08B] hover:text-[#7ee3a3] underline"
                      >
                        /{redirect.newSlug}
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-[#404055] px-2 py-1 rounded text-xs capitalize">
                        {redirect.entityType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-400">
                      {new Date(redirect.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => deleteRedirect(redirect.oldSlug)}
                        className="text-red-400 hover:text-red-300 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 