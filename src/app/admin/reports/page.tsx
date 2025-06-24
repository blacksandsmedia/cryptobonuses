"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { normalizeImagePath } from "@/lib/utils";

interface CasinoReport {
  id: string;
  reason: string;
  description?: string;
  reporterIp: string;
  status: 'PENDING' | 'VERIFIED';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  casino: {
    name: string;
    slug: string;
    logo?: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const statusColors = {
  PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  VERIFIED: 'bg-green-500/10 text-green-400 border-green-500/20'
};

const reasonLabels = {
  MISLEADING_BONUSES: 'Misleading bonus terms or advertisements',
  FAKE_REVIEWS: 'Fake reviews or manipulated ratings',
  PAYMENT_DELAYS: 'Delays or refusal to pay winnings',
  UNFAIR_TERMS: 'Unfair terms and conditions',
  SCAM_ACTIVITY: 'Suspected scam or fraudulent activity',
  POOR_CUSTOMER_SERVICE: 'Poor customer support',
  RIGGED_GAMES: 'Games appear rigged or unfair',
  IDENTITY_THEFT: 'Misuse of personal information',
  OTHER: 'Other casino-related issues'
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<CasinoReport[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedReport, setSelectedReport] = useState<CasinoReport | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [pagination.page, statusFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await fetch(`/api/reports?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyReport = async (reportId: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/reports/${reportId}/verify`, {
        method: 'PUT',
      });

      if (response.ok) {
        // Refresh the reports list
        await fetchReports();
        alert('Report verified successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to verify report');
      }
    } catch (error) {
      console.error('Error verifying report:', error);
      alert('Failed to verify report');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateReport = async () => {
    if (!selectedReport) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/reports/${selectedReport.id}/verify`, {
        method: 'PUT',
      });

      if (response.ok) {
        setSelectedReport(null);
        setNewStatus('');
        setAdminNotes('');
        await fetchReports();
        alert('Report updated successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update report');
      }
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Failed to update report');
    } finally {
      setIsUpdating(false);
    }
  };

  const closeModal = () => {
    setSelectedReport(null);
    setNewStatus('');
    setAdminNotes('');
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchReports();
        alert('Report deleted successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete report');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Failed to delete report');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedReports.size === 0) {
      alert('Please select reports to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedReports.size} report${selectedReports.size !== 1 ? 's' : ''}? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/reports/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: Array.from(selectedReports)
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedReports(new Set());
        await fetchReports();
        alert(data.message || 'Reports deleted successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete reports');
      }
    } catch (error) {
      console.error('Error deleting reports:', error);
      alert('Failed to delete reports');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectReport = (reportId: string) => {
    const newSelected = new Set(selectedReports);
    if (newSelected.has(reportId)) {
      newSelected.delete(reportId);
    } else {
      newSelected.add(reportId);
    }
    setSelectedReports(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedReports.size === reports.length) {
      setSelectedReports(new Set());
    } else {
      setSelectedReports(new Set(reports.map(report => report.id)));
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Casino Reports</h1>
        <p className="text-[#a4a5b0]">Review and verify user-submitted reports about casinos</p>
      </div>

      {/* Filters and Bulk Actions */}
      <div className="bg-[#2c2f3a] rounded-xl p-4 mb-6 border border-[#404055]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <label className="text-white font-medium">Filter by status:</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="bg-[#1a1a27] border border-[#404055] text-white rounded-lg px-3 py-2 focus:border-[#68D08B] focus:outline-none"
              >
                <option value="">All statuses</option>
                <option value="PENDING">Pending</option>
                <option value="VERIFIED">Verified</option>
              </select>
            </div>
            
            <div className="text-sm text-[#a4a5b0]">
              Total reports: {pagination.total}
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedReports.size > 0 && (
            <div className="flex items-center gap-3 p-3 bg-[#1a1a27] rounded-lg border-l-4 border-[#68D08B]">
              <span className="text-white font-medium">
                {selectedReports.size} report{selectedReports.size !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 disabled:bg-[#404055] text-white disabled:text-[#6b6b7d] px-3 py-1 rounded-lg text-sm font-medium transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Delete Selected'}
              </button>
              <button
                onClick={() => setSelectedReports(new Set())}
                className="text-[#a4a5b0] hover:text-white text-sm"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-[#2c2f3a] rounded-xl border border-[#404055] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="text-[#a4a5b0]">Loading reports...</div>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-[#a4a5b0]">No reports found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1a1a27] border-b border-[#404055]">
                <tr>
                  <th className="text-left p-4 text-white font-medium w-12">
                    <input
                      type="checkbox"
                      checked={reports.length > 0 && selectedReports.size === reports.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-[#68D08B] bg-[#2c2f3a] border-[#404055] rounded focus:ring-[#68D08B] focus:ring-2"
                    />
                  </th>
                  <th className="text-left p-4 text-white font-medium">Casino</th>
                  <th className="text-left p-4 text-white font-medium">Reason</th>
                  <th className="text-left p-4 text-white font-medium">Status</th>
                  <th className="text-left p-4 text-white font-medium">Date</th>
                  <th className="text-left p-4 text-white font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report, index) => (
                  <tr 
                    key={report.id} 
                    className={`border-b border-[#404055]/30 hover:bg-[#343541] transition-colors ${index % 2 === 0 ? 'bg-[#2c2f3a]' : 'bg-[#262936]'}`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedReports.has(report.id)}
                        onChange={() => handleSelectReport(report.id)}
                        className="w-4 h-4 text-[#68D08B] bg-[#2c2f3a] border-[#404055] rounded focus:ring-[#68D08B] focus:ring-2"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {report.casino.logo && (
                          <Image
                            src={normalizeImagePath(report.casino.logo)}
                            alt={report.casino.name}
                            width={32}
                            height={32}
                            className="rounded object-cover"
                          />
                        )}
                        <div>
                          <div className="text-white font-medium">{report.casino.name}</div>
                          <div className="text-[#a4a5b0] text-sm">{report.casino.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-white font-medium">
                        {reasonLabels[report.reason as keyof typeof reasonLabels] || report.reason}
                      </div>
                      {report.description && (
                        <div className="text-[#a4a5b0] text-sm mt-1 line-clamp-2">
                          {report.description}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[report.status]}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-[#a4a5b0] text-sm">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {report.status === 'PENDING' && (
                          <button
                            onClick={() => handleVerifyReport(report.id)}
                            disabled={isUpdating || isDeleting}
                            className="bg-[#68D08B] hover:bg-[#7ee095] disabled:bg-[#404055] text-[#1a1a1a] disabled:text-[#6b6b7d] px-3 py-1 rounded text-sm font-medium transition-colors"
                          >
                            ✓ Verify
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setNewStatus(report.status);
                            setAdminNotes(report.adminNotes || '');
                          }}
                          disabled={isDeleting}
                          className="bg-[#404055] hover:bg-[#4a5160] disabled:bg-[#2a2a2a] text-white disabled:text-[#6b6b7d] px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteReport(report.id)}
                          disabled={isDeleting || isUpdating}
                          className="bg-red-600 hover:bg-red-700 disabled:bg-[#404055] text-white disabled:text-[#6b6b7d] px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          {isDeleting ? '...' : '🗑️'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
            className="px-3 py-2 bg-[#2c2f3a] border border-[#404055] text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#252831]"
          >
            Previous
          </button>
          
          <span className="text-[#a4a5b0] px-4">
            Page {pagination.page} of {pagination.pages}
          </span>
          
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
            disabled={pagination.page === pagination.pages}
            className="px-3 py-2 bg-[#2c2f3a] border border-[#404055] text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#252831]"
          >
            Next
          </button>
        </div>
      )}

      {/* Report Review Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#2c2f3a] rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#404055]">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white">
                {selectedReport.status === 'PENDING' ? 'Verify Report' : 'Review Report'}
              </h2>
              <button
                onClick={closeModal}
                className="text-[#a4a5b0] hover:text-white p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Casino Info */}
              <div className="flex items-center gap-3 p-3 bg-[#1a1a27] rounded-lg">
                {selectedReport.casino.logo && (
                  <Image
                    src={normalizeImagePath(selectedReport.casino.logo)}
                    alt={selectedReport.casino.name}
                    width={40}
                    height={40}
                    className="rounded object-cover"
                  />
                )}
                <div>
                  <div className="text-white font-medium">{selectedReport.casino.name}</div>
                  <div className="text-[#a4a5b0] text-sm">{selectedReport.casino.slug}</div>
                </div>
              </div>

              {/* Report Details */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[#a4a5b0] text-sm mb-1">Reason:</label>
                  <div className="text-white">
                    {reasonLabels[selectedReport.reason as keyof typeof reasonLabels] || selectedReport.reason}
                  </div>
                </div>

                {selectedReport.description && (
                  <div>
                    <label className="block text-[#a4a5b0] text-sm mb-1">Description:</label>
                    <div className="text-white bg-[#1a1a27] p-3 rounded-lg">
                      {selectedReport.description}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#a4a5b0] text-sm mb-1">Reporter IP:</label>
                    <div className="text-white font-mono text-sm">{selectedReport.reporterIp}</div>
                  </div>
                  <div>
                    <label className="block text-[#a4a5b0] text-sm mb-1">Reported:</label>
                    <div className="text-white text-sm">
                      {new Date(selectedReport.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {selectedReport.adminNotes && (
                  <div>
                    <label className="block text-[#a4a5b0] text-sm mb-1">Previous Admin Notes:</label>
                    <div className="text-white bg-[#1a1a27] p-3 rounded-lg text-sm">
                      {selectedReport.adminNotes}
                    </div>
                  </div>
                )}
              </div>

              {/* Update Form */}
              <div className="space-y-4 pt-4 border-t border-[#404055]">
                <div>
                  <label className="block text-white font-medium mb-2">Update Status:</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-[#1a1a27] border border-[#404055] text-white rounded-lg px-3 py-2 focus:border-[#68D08B] focus:outline-none"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="VERIFIED">Verified</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Admin Notes:</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about your review or action taken..."
                    rows={3}
                    className="w-full bg-[#1a1a27] border border-[#404055] text-white rounded-lg px-3 py-2 focus:border-[#68D08B] focus:outline-none resize-vertical"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleUpdateReport}
                    disabled={isUpdating || isDeleting}
                    className="bg-[#68D08B] hover:bg-[#7ee095] disabled:bg-[#404055] text-[#1a1a1a] disabled:text-[#6b6b7d] px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    {isUpdating ? 'Updating...' : selectedReport.status === 'PENDING' ? 'Verify Report' : 'Update Report'}
                  </button>
                  <button
                    onClick={() => {
                      closeModal();
                      handleDeleteReport(selectedReport.id);
                    }}
                    disabled={isUpdating || isDeleting}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-[#404055] text-white disabled:text-[#6b6b7d] px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Report'}
                  </button>
                  <button
                    onClick={closeModal}
                    disabled={isDeleting}
                    className="px-4 py-2 border border-[#404055] text-[#a4a5b0] hover:text-white hover:border-[#68D08B]/30 disabled:opacity-50 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 