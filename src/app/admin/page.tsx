"use client";

import Link from "next/link";
import { useState, useEffect } from 'react';

interface NewsletterData {
  totalSubscribers: number;
  subscribersThisMonth: number;
  subscribers: { id: string; email: string; subscribedAt: string; }[];
}

export default function AdminDashboard() {
  const [newsletterData, setNewsletterData] = useState<NewsletterData | null>(null);
  const [newsletterLoading, setNewsletterLoading] = useState(true);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchNewsletterData();
  }, []);

  const fetchNewsletterData = async () => {
    setNewsletterLoading(true);
    setNewsletterError(null);
    try {
      const response = await fetch('/api/newsletter');
      if (response.ok) {
        const data = await response.json();
        setNewsletterData(data);
      } else {
        setNewsletterError('Failed to load newsletter data');
      }
    } catch (error) {
      console.error('Error fetching newsletter data:', error);
      setNewsletterError('Failed to load newsletter data');
    } finally {
      setNewsletterLoading(false);
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
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Functions */}
      <div className="bg-[#292932] shadow-md rounded-lg p-6 border border-[#404055]">
        <h2 className="text-2xl font-bold text-white mb-4">Admin Functions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/admin/casinos"
            className="block p-6 bg-[#373946] border border-[#404055] rounded-lg shadow-md hover:bg-[#3c3f4a] transition-colors"
          >
            <h3 className="text-lg font-semibold text-white">Casinos</h3>
            <p className="mt-2 text-[#a7a9b4]">Manage casino listings and details</p>
          </Link>
          <Link
            href="/admin/newsletter"
            className="block p-6 bg-[#373946] border border-[#404055] rounded-lg shadow-md hover:bg-[#3c3f4a] transition-colors"
          >
            <h3 className="text-lg font-semibold text-white">Newsletter</h3>
            <p className="mt-2 text-[#a7a9b4]">Manage newsletter subscribers and exports</p>
          </Link>
          <Link
            href="/admin/reviews"
            className="block p-6 bg-[#373946] border border-[#404055] rounded-lg shadow-md hover:bg-[#3c3f4a] transition-colors"
          >
            <h3 className="text-lg font-semibold text-white">Reviews</h3>
            <p className="mt-2 text-[#a7a9b4]">Manage user reviews and feedback</p>
          </Link>
          <Link
            href="/admin/reports"
            className="block p-6 bg-[#373946] border border-[#404055] rounded-lg shadow-md hover:bg-[#3c3f4a] transition-colors"
          >
            <h3 className="text-lg font-semibold text-white">Reports</h3>
            <p className="mt-2 text-[#a7a9b4]">Manage user-submitted casino reports</p>
          </Link>
          <Link
            href="/admin/analytics"
            className="block p-6 bg-[#373946] border border-[#404055] rounded-lg shadow-md hover:bg-[#3c3f4a] transition-colors"
          >
            <h3 className="text-lg font-semibold text-white">Analytics</h3>
            <p className="mt-2 text-[#a7a9b4]">Track offer copies, clicks and engagement</p>
          </Link>
          <Link
            href="/admin/search-analytics"
            className="block p-6 bg-[#373946] border border-[#404055] rounded-lg shadow-md hover:bg-[#3c3f4a] transition-colors"
          >
            <h3 className="text-lg font-semibold text-white">Search Analytics</h3>
            <p className="mt-2 text-[#a7a9b4]">Monitor search queries and user behavior</p>
          </Link>
          <Link
            href="/admin/page-checks"
            className="block p-6 bg-[#373946] border border-[#404055] rounded-lg shadow-md hover:bg-[#3c3f4a] transition-colors"
          >
            <h3 className="text-lg font-semibold text-white">Page Checks</h3>
            <p className="mt-2 text-[#a7a9b4]">Manage page checks and verification</p>
          </Link>
          <Link
            href="/admin/pages"
            className="block p-6 bg-[#373946] border border-[#404055] rounded-lg shadow-md hover:bg-[#3c3f4a] transition-colors"
          >
            <h3 className="text-lg font-semibold text-white">Pages</h3>
            <p className="mt-2 text-[#a7a9b4]">Manage website pages and content</p>
          </Link>
          <Link
            href="/admin/enquiries"
            className="block p-6 bg-[#373946] border border-[#404055] rounded-lg shadow-md hover:bg-[#3c3f4a] transition-colors"
          >
            <h3 className="text-lg font-semibold text-white">Enquiries</h3>
            <p className="mt-2 text-[#a7a9b4]">Manage contact form submissions</p>
          </Link>
          <Link
            href="/admin/users"
            className="block p-6 bg-[#373946] border border-[#404055] rounded-lg shadow-md hover:bg-[#3c3f4a] transition-colors"
          >
            <h3 className="text-lg font-semibold text-white">Users</h3>
            <p className="mt-2 text-[#a7a9b4]">Manage user accounts and permissions</p>
          </Link>
          <Link
            href="/admin/redirects"
            className="block p-6 bg-[#373946] border border-[#404055] rounded-lg shadow-md hover:bg-[#3c3f4a] transition-colors"
          >
            <h3 className="text-lg font-semibold text-white">Redirects</h3>
            <p className="mt-2 text-[#a7a9b4]">Create manual 301 redirects and view automatic ones</p>
          </Link>
          <Link
            href="/admin/settings"
            className="block p-6 bg-[#373946] border border-[#404055] rounded-lg shadow-md hover:bg-[#3c3f4a] transition-colors"
          >
            <h3 className="text-lg font-semibold text-white">Settings</h3>
            <p className="mt-2 text-[#a7a9b4]">Configure site settings and preferences</p>
          </Link>
        </div>
      </div>
    </div>
  );
} 