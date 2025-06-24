'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  email: string;
  role: string;
}

export default function PagesAdmin() {
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    content: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch pages after authentication is confirmed
  useEffect(() => {
    if (isAuthenticated) {
      fetchPages();
    }
  }, [isAuthenticated]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin-auth');
      const data = await response.json();
      
      if (response.ok && data.success && data.user) {
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        // Redirect to login if not authenticated
        router.push('/admin/login');
        return;
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/admin/login');
      return;
    } finally {
      setLoading(false);
    }
  };

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/legal-pages');
      if (response.ok) {
        const pagesData = await response.json();
        setPages(pagesData);
      } else {
        toast.error('Failed to fetch pages');
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast.error('Failed to fetch pages');
    }
  };

  const handlePageSelect = (page: Page) => {
    setSelectedPage(page);
    setFormData({
      slug: page.slug,
      title: page.title,
      content: page.content
    });
    setIsEditing(true);
  };

  const handleNewPage = () => {
    setSelectedPage(null);
    setFormData({
      slug: '',
      title: '',
      content: ''
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!formData.slug || !formData.title || !formData.content) {
      toast.error('Please fill in all fields');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/legal-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Page saved successfully');
        setIsEditing(false);
        fetchPages();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save page');
      }
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedPage(null);
    setFormData({ slug: '', title: '', content: '' });
  };

  const handleDeletePage = async (pageId: string) => {
    if (!window.confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/legal-pages?id=${pageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Page deleted successfully!');
        await fetchPages();
        // Clear selection if deleted page was selected
        if (selectedPage?.id === pageId) {
          setSelectedPage(null);
          setIsEditing(false);
        }
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete page');
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('Failed to delete page');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPages.size === 0) {
      toast.error('Please select pages to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedPages.size} page${selectedPages.size !== 1 ? 's' : ''}? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/legal-pages/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: Array.from(selectedPages)
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedPages(new Set());
        await fetchPages();
        toast.success(data.message || 'Pages deleted successfully!');
        // Clear selection if deleted page was selected
        if (selectedPage && selectedPages.has(selectedPage.id)) {
          setSelectedPage(null);
          setIsEditing(false);
        }
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete pages');
      }
    } catch (error) {
      console.error('Error deleting pages:', error);
      toast.error('Failed to delete pages');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectPage = (pageId: string) => {
    const newSelected = new Set(selectedPages);
    if (newSelected.has(pageId)) {
      newSelected.delete(pageId);
    } else {
      newSelected.add(pageId);
    }
    setSelectedPages(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedPages.size === pages.length) {
      setSelectedPages(new Set());
    } else {
      setSelectedPages(new Set(pages.map(page => page.id)));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#343541] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#68D08B] border-r-transparent"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#343541] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Pages Management</h1>
          <button
            onClick={handleNewPage}
            className="bg-[#68D08B] hover:bg-[#5abc7a] text-[#343541] font-semibold px-6 py-2 rounded-lg transition-colors duration-300"
          >
            New Page
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pages List */}
          <div className="lg:col-span-1">
            <div className="bg-[#3e4050] rounded-xl p-6 border border-[#404055]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Pages</h2>
                {pages.length > 0 && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={pages.length > 0 && selectedPages.size === pages.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-[#68D08B] bg-[#2c2f3a] border-[#404055] rounded focus:ring-[#68D08B] focus:ring-2"
                      title="Select all"
                    />
                    <span className="text-sm text-[#a4a5b0]">All</span>
                  </div>
                )}
              </div>

              {/* Bulk Actions */}
              {selectedPages.size > 0 && (
                <div className="mb-4 p-3 bg-[#2c2f3a] rounded-lg border-l-4 border-[#68D08B]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">
                      {selectedPages.size} page{selectedPages.size !== 1 ? 's' : ''} selected
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={handleBulkDelete}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-[#404055] text-white disabled:text-[#6b6b7d] px-3 py-1 rounded text-sm font-medium transition-colors"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete Selected'}
                      </button>
                      <button
                        onClick={() => setSelectedPages(new Set())}
                        className="text-[#a4a5b0] hover:text-white text-sm"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {pages.map((page) => (
                  <div
                    key={page.id}
                    className={`p-3 rounded-lg border transition-colors duration-200 ${
                      selectedPage?.id === page.id
                        ? 'bg-[#68D08B] text-black border-[#68D08B]'
                        : 'bg-[#2c2f3a] hover:bg-[#404055] text-white border-[#404055]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedPages.has(page.id)}
                        onChange={() => handleSelectPage(page.id)}
                        className="w-4 h-4 text-[#68D08B] bg-[#2c2f3a] border-[#404055] rounded focus:ring-[#68D08B] focus:ring-2"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        onClick={() => handlePageSelect(page)}
                        className="flex-1 text-left"
                      >
                        <div className="font-medium">{page.title}</div>
                        <div className="text-sm opacity-70">/{page.slug}</div>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePage(page.id);
                        }}
                        disabled={isDeleting}
                        className="p-1 text-red-400 hover:text-red-300 disabled:text-[#6b6b7d] transition-colors"
                        title="Delete page"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
                {pages.length === 0 && (
                  <p className="text-[#a4a5b0] text-center py-4">No pages found</p>
                )}
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="lg:col-span-2">
            {isEditing ? (
              <div className="bg-[#3e4050] rounded-xl p-6 border border-[#404055]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    {selectedPage ? 'Edit Page' : 'New Page'}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      disabled={isDeleting}
                      className="px-4 py-2 text-[#a4a5b0] hover:text-white disabled:opacity-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    {selectedPage && (
                      <button
                        onClick={() => {
                          handleCancel();
                          handleDeletePage(selectedPage.id);
                        }}
                        disabled={saving || isDeleting}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-[#404055] text-white disabled:text-[#6b6b7d] px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete Page'}
                      </button>
                    )}
                    <button
                      onClick={handleSave}
                      disabled={saving || isDeleting}
                      className="bg-[#68D08B] hover:bg-[#5abc7a] disabled:bg-[#68D08B]/50 text-[#343541] font-semibold px-6 py-2 rounded-lg transition-colors duration-300 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-4 py-2 bg-[#2c2f3a] border border-[#404055] rounded-lg focus:outline-none focus:border-[#68D08B] transition-colors duration-200"
                      placeholder="e.g., privacy, terms, contact"
                      disabled={!!selectedPage} // Don't allow changing slug for existing pages
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 bg-[#2c2f3a] border border-[#404055] rounded-lg focus:outline-none focus:border-[#68D08B] transition-colors duration-200"
                      placeholder="Page title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Content (HTML)</label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={20}
                      className="w-full px-4 py-2 bg-[#2c2f3a] border border-[#404055] rounded-lg focus:outline-none focus:border-[#68D08B] transition-colors duration-200 font-mono text-sm"
                      placeholder="Enter HTML content..."
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#3e4050] rounded-xl p-6 border border-[#404055] text-center">
                <p className="text-[#a4a5b0] mb-4">Select a page to edit or create a new one</p>
                <button
                  onClick={handleNewPage}
                  className="bg-[#68D08B] hover:bg-[#5abc7a] text-[#343541] font-semibold px-6 py-2 rounded-lg transition-colors duration-300"
                >
                  Create New Page
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 