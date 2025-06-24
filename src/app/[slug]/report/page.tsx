"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Casino {
  id: string;
  name: string;
  slug: string;
  logo?: string;
}

interface ExistingReport {
  id: string;
  reason: string;
  description?: string;
  createdAt: string;
}

const reportReasons = [
  { value: 'MISLEADING_BONUSES', label: 'Misleading bonus terms or advertisements' },
  { value: 'FAKE_REVIEWS', label: 'Fake reviews or manipulated ratings' },
  { value: 'PAYMENT_DELAYS', label: 'Delays or refusal to pay winnings' },
  { value: 'UNFAIR_TERMS', label: 'Unfair terms and conditions' },
  { value: 'SCAM_ACTIVITY', label: 'Suspected scam or fraudulent activity' },
  { value: 'POOR_CUSTOMER_SERVICE', label: 'Poor customer support' },
  { value: 'RIGGED_GAMES', label: 'Games appear rigged or unfair' },
  { value: 'IDENTITY_THEFT', label: 'Misuse of personal information' },
  { value: 'OTHER', label: 'Other casino-related issues' }
];

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

export default function ReportCasinoPage({
  params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();
  const [casino, setCasino] = useState<Casino | null>(null);
  const [existingReports, setExistingReports] = useState<ExistingReport[]>([]);
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error' | 'already_reported'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Set document title when casino data loads
  useEffect(() => {
    if (casino?.name) {
      document.title = `${casino.name} Reports - View & Submit Issues`;
    }
  }, [casino?.name]);

  // Scroll to top when submit status changes to success or already_reported
  useEffect(() => {
    if (submitStatus === 'success' || submitStatus === 'already_reported') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [submitStatus]);

  useEffect(() => {
    // Fetch casino details
    const fetchCasino = async () => {
      try {
        // Now slug is the parameter, so we fetch by slug
        const response = await fetch(`/api/casinos/${params.slug}`);
        if (response.ok) {
          const data = await response.json();
          setCasino(data.casino);
          
          // Fetch existing reports for this casino
          if (data.casino?.id) {
            fetchExistingReports(data.casino.id);
          }
        }
      } catch (error) {
        console.error('Error fetching casino:', error);
      }
    };

    fetchCasino();
  }, [params.slug]);

  const fetchExistingReports = async (casinoId: string) => {
    try {
      const response = await fetch(`/api/reports/public?casinoId=${casinoId}`);
      if (response.ok) {
        const data = await response.json();
        setExistingReports(data.reports || []);
      }
    } catch (error) {
      console.error('Error fetching existing reports:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedReason) {
      setErrorMessage('Please select a reason for reporting');
      return;
    }

    if (!casino?.id) {
      setErrorMessage('Casino not found');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          casinoId: casino.id, // Use the actual casino ID from the fetched data
          reason: selectedReason,
          description: description.trim() || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
      } else if (response.status === 409) {
        setSubmitStatus('already_reported');
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.error || 'Failed to submit report');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-[#343541] text-white">
        <div className="container mx-auto px-4" style={{ paddingTop: '200px', paddingBottom: '32px' }}>
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4">Report Submitted</h1>
            <p className="text-[#a4a5b0] text-lg mb-8">
              Thank you for reporting {casino?.name}. We take all reports seriously and will investigate this matter.
            </p>
            <div className="space-y-4">
              <Link
                href={`/${params.slug}`}
                className="inline-block bg-[#68D08B] hover:bg-[#7ee095] text-[#1a1a1a] px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Back to Casino
              </Link>
              <br />
              <Link
                href="/"
                className="inline-block text-[#a7a9b4] hover:text-white transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (submitStatus === 'already_reported') {
    return (
      <div className="min-h-screen bg-[#343541] text-white">
        <div className="container mx-auto px-4" style={{ paddingTop: '200px', paddingBottom: '32px' }}>
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4">Already Reported</h1>
            <p className="text-[#a4a5b0] text-lg mb-8">
              You have already submitted a report for {casino?.name}. We limit one report per person to prevent spam.
            </p>
            <div className="space-y-4">
              <Link
                href={`/${params.slug}`}
                className="inline-block bg-[#68D08B] hover:bg-[#7ee095] text-[#1a1a1a] px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Back to Casino
              </Link>
              <br />
              <Link
                href="/"
                className="inline-block text-[#a7a9b4] hover:text-white transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#343541] text-white">
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center" style={{ marginTop: '4rem', marginBottom: '4rem' }}>
            <h1 className="text-3xl font-bold mb-4">
              Report {casino?.name || 'Casino'}
            </h1>
            {casino && (
              <Link href={`/${casino.slug}`} className="inline-block group">
                <div className="flex items-center justify-center gap-4 mb-6 hover:opacity-80 transition-opacity">
                  {casino.logo && (
                    <img
                      src={casino.logo}
                      alt={casino.name}
                      className="w-12 h-12 rounded-lg object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                  <h2 className="text-xl font-semibold text-[#68D08B] group-hover:text-[#7ee095] transition-colors">{casino.name}</h2>
                </div>
              </Link>
            )}
            <p className="text-[#a4a5b0]">
              Help us maintain quality by reporting issues with this casino. All reports are reviewed by our team.
            </p>
          </div>

          {/* Report Form */}
          <div className="bg-[#2c2f3a] rounded-xl p-6 border border-[#404055] mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Reason Selection */}
              <div>
                <label className="block text-lg font-semibold mb-4">
                  Why are you reporting this casino? <span className="text-red-400">*</span>
                </label>
                <div className="space-y-3">
                  {reportReasons.map((reason) => (
                    <label
                      key={reason.value}
                      className="flex items-start gap-3 p-3 rounded-lg border border-[#404055] hover:border-[#68D08B]/30 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={reason.value}
                        checked={selectedReason === reason.value}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="mt-1 w-4 h-4 text-[#68D08B] bg-[#1a1a27] border-[#404055] focus:ring-[#68D08B] focus:ring-2 focus:ring-offset-0"
                      />
                      <span className="text-[#a4a5b0]">{reason.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-lg font-semibold mb-2">
                  Additional Details (Optional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide any additional information about the issue..."
                  rows={4}
                  className="w-full bg-[#1a1a27] border border-[#404055] rounded-lg px-4 py-3 text-white placeholder-[#6b6b7d] focus:border-[#68D08B] focus:ring-2 focus:ring-[#68D08B]/20 focus:outline-none transition-colors resize-vertical"
                  maxLength={1000}
                />
                <div className="text-right text-sm text-[#6b6b7d] mt-1">
                  {description.length}/1000 characters
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400">{errorMessage}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedReason}
                  className="flex-1 bg-[#68D08B] hover:bg-[#7ee095] disabled:bg-[#404055] disabled:cursor-not-allowed text-[#1a1a1a] disabled:text-[#6b6b7d] py-3 px-6 rounded-xl font-semibold transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
                <Link
                  href={`/${params.slug}`}
                  className="px-6 py-3 border border-[#404055] hover:border-[#68D08B]/30 text-[#a4a5b0] hover:text-white rounded-xl font-semibold transition-colors text-center"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>

          {/* Existing Reports Section */}
          {existingReports.length > 0 && (
            <div className="bg-[#2c2f3a] rounded-xl p-6 border border-[#404055]" style={{ marginBottom: '4rem' }}>
              <h2 className="text-xl font-semibold mb-4">{casino?.name} Reports</h2>
              <div className="space-y-4">
                {existingReports.map((report) => (
                  <div key={report.id} className="bg-[#1a1a27] rounded-lg p-4 border border-[#404055]/50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-[#68D08B]">
                        {reasonLabels[report.reason as keyof typeof reasonLabels] || report.reason}
                      </h3>
                      <span className="text-sm text-[#a4a5b0]">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {report.description && (
                      <p className="text-[#a4a5b0] text-sm leading-relaxed">
                        {report.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="p-4 bg-[#1a1a27] rounded-lg border border-[#404055]/50" style={{ marginTop: '2rem', marginBottom: '6rem' }}>
            <p className="text-sm text-[#6b6b7d] leading-relaxed">
              <strong>Note:</strong> False reports may result in restrictions on future reporting. 
              We only allow one report per casino per person to prevent spam. All reports are 
              reviewed manually by our team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 