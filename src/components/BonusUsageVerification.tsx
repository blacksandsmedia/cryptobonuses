'use client';

import { useState, useEffect } from 'react';
import ShareIcons from './ShareIcons';
import { useTranslation } from '@/contexts/TranslationContext';

interface BonusUsageVerificationProps {
  bonusId?: string;
  formattedDate: string;
  casinoSlug: string;
  casinoName: string;
  bonusTitle: string;
}

export default function BonusUsageVerification({
  bonusId,
  formattedDate,
  casinoSlug,
  casinoName,
  bonusTitle
}: BonusUsageVerificationProps) {
  const [lastUsed, setLastUsed] = useState<string>('Loading...');
  const [usageCount, setUsageCount] = useState<number>(0);

  // Add translation support with English fallbacks
  let t;
  try {
    const translation = useTranslation();
    t = translation.t;
  } catch {
    // Not in translation context, return English fallbacks
    const englishTranslations: Record<string, string> = {
      'verification.title': 'Bonus Usage & Verification',
      'verification.realTimeData': 'Real-time Usage Data',
      'verification.trackingStats': 'Live bonus tracking statistics',
      'verification.lastUsed': 'Last Used',
      'verification.usedToday': 'Used Today',
      'verification.verifiedActive': 'Verified & Active',
      'verification.verified': 'VERIFIED',
      'verification.teamVerification': 'Our team has verified this bonus offer is active and working. All terms have been reviewed for accuracy.',
      'verification.verifiedDate': `Verified ${formattedDate}`,
      'verification.shareOffer': 'Share Offer',
      'verification.reportIssue': 'Report Issue',
      'verification.foundProblem': 'Found a problem? Let us know',
      'verification.ageRestriction': '18+ Only',
      'verification.gambleResponsibly': 'Gamble Responsibly',
      'verification.termsApply': 'Terms Apply'
    };
    t = (key: string, interpolations?: Record<string, string | number>) => {
      let text = englishTranslations[key] || key;
      if (interpolations && typeof text === 'string') {
        Object.entries(interpolations).forEach(([key, value]) => {
          text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
        });
      }
      return text;
    };
  }

  useEffect(() => {
    const fetchUsageData = async () => {
      if (!bonusId) return;

      try {
        const response = await fetch(`/api/tracking?bonusId=${bonusId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch usage data');
        }
        const data = await response.json();

        setLastUsed(data.lastUsed ? formatTimeAgo(data.lastUsed) : 'Never used');
        setUsageCount(data.usageCount || 0);
      } catch (error) {
        console.error('Error fetching usage data:', error);
        setLastUsed('Unable to load');
        setUsageCount(0);
      }
    };

    fetchUsageData();
    const interval = setInterval(fetchUsageData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [bonusId]);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return Math.floor(diffInSeconds / 60) + 'm ago';
    if (diffInSeconds < 86400) return Math.floor(diffInSeconds / 3600) + 'h ago';

    const days = Math.floor(diffInSeconds / 86400);
    if (days === 1) return '1 day ago';
    if (days < 7) return days + 'd ago';

    const weeks = Math.floor(days / 7);
    if (weeks === 1) return '1 week ago';
    if (weeks < 4) return weeks + 'w ago';

    const months = Math.floor(days / 30);
    if (months === 1) return '1 month ago';
    return months + 'mo ago';
  };

  return (
    <div className="bg-[#3e4050] rounded-xl px-7 py-6 sm:p-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-6">{t('verification.title') || 'Bonus Usage & Verification'}</h2>
      
      {/* Main Content Container */}
      <div className="bg-[#2c2f3a] rounded-xl border border-[#404055] overflow-hidden">
        {/* Usage Statistics Header */}
        {bonusId && (
          <div className="p-6 border-b border-[#404055]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#68D08B]/20 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#68D08B]">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">{t('verification.realTimeData') || 'Real-time Usage Data'}</h3>
                <p className="text-white/60 text-sm">{t('verification.trackingStats') || 'Live bonus tracking statistics'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-[#343541]/50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#68D08B]">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span className="text-sm text-white/80">{t('verification.lastUsed') || 'Last Used'}</span>
                </div>
                <div className="text-lg font-bold text-white" id="last-used-value">
                  <div className="animate-pulse">
                    <div className="h-5 bg-[#404055] rounded w-16 mx-auto"></div>
                  </div>
                </div>
              </div>
              
              <div className="text-center p-3 bg-[#343541]/50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#68D08B]">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="m22 21-3-3"/>
                  </svg>
                  <span className="text-sm text-white/80">{t('verification.usedToday') || 'Used Today'}</span>
                </div>
                <div className="text-lg font-bold text-white" id="usage-count-value">
                  <div className="animate-pulse">
                    <div className="h-5 bg-[#404055] rounded w-12 mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verification Status */}
        <div className="p-6 bg-gradient-to-r from-[#68D08B]/5 to-emerald-500/5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#68D08B]/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#68D08B]">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-white font-bold text-lg">{t('verification.verifiedActive') || 'Verified & Active'}</h3>
                <span className="bg-[#68D08B]/20 text-[#68D08B] text-xs px-2.5 py-1 rounded-md font-medium border border-[#68D08B]/30">
                  {t('verification.verified') || 'VERIFIED'}
                </span>
              </div>
              <p className="text-white/80 text-sm leading-relaxed mb-3">
                {t('verification.teamVerification') || 'Our team has verified this bonus offer is active and working. All terms have been reviewed for accuracy.'}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-[#68D08B] rounded-full"></div>
                <span className="text-[#68D08B] font-medium">{t('verification.verifiedDate', { date: formattedDate }) || `Verified ${formattedDate}`}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="p-6 bg-[#252831]/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Share */}
            <div className="flex items-center gap-3 p-4 bg-[#343541]/30 rounded-lg border border-[#404055]/50 hover:border-[#68D08B]/30 transition-colors">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                  <path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3"/>
                  <line x1="8" x2="16" y1="12" y2="12"/>
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium text-sm">{t('verification.shareOffer') || 'Share Offer'}</h4>
                <div className="mt-2">
                  <ShareIcons 
                    title={`${casinoName} Bonus - ${bonusTitle}`} 
                    url={`/${casinoSlug}`}
                  />
                </div>
              </div>
            </div>

            {/* Report */}
            <a
              href={`/${casinoSlug}/report`}
              className="flex items-center gap-3 p-4 bg-[#343541]/30 rounded-lg border border-[#404055]/50 hover:border-orange-400/30 transition-all hover:bg-[#343541]/50 group"
            >
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" x2="12" y1="9" y2="13"/>
                  <line x1="12" x2="12.01" y1="17" y2="17"/>
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium text-sm group-hover:text-orange-400 transition-colors">{t('verification.reportIssue') || 'Report Issue'}</h4>
                <p className="text-white/60 text-xs mt-0.5">{t('verification.foundProblem') || 'Found a problem? Let us know'}</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Legal Notice */}
      <div className="mt-4 p-4 bg-[#252831]/50 rounded-lg border border-[#404055]/30">
        <div className="text-xs text-white/60 flex flex-wrap items-center gap-3 justify-center">
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            {t('verification.ageRestriction') || '18+ Only'}
          </span>
          <span className="text-[#6b7280]">•</span>
          <span>{t('verification.gambleResponsibly') || 'Gamble Responsibly'}</span>
          <span className="text-[#6b7280]">•</span>
          <span>{t('verification.termsApply') || 'Terms Apply'}</span>
          <span className="text-[#6b7280]">•</span>
          <a href="https://www.gambleaware.org" target="_blank" rel="nofollow" className="text-[#68D08B] hover:text-[#7ee3a3] transition-colors">
            GambleAware.org
          </a>
        </div>
      </div>

      {/* Client-side script to fetch and display usage data */}
      {bonusId && (
        <script 
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const bonusId = '${bonusId}';
                
                function formatTimeAgo(dateString) {
                  const now = new Date();
                  const past = new Date(dateString);
                  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
                  
                  if (diffInSeconds < 60) return 'Just now';
                  if (diffInSeconds < 3600) return Math.floor(diffInSeconds / 60) + 'm ago';
                  if (diffInSeconds < 86400) return Math.floor(diffInSeconds / 3600) + 'h ago';
                  
                  const days = Math.floor(diffInSeconds / 86400);
                  if (days === 1) return '1 day ago';
                  if (days < 7) return days + 'd ago';
                  
                  const weeks = Math.floor(days / 7);
                  if (weeks === 1) return '1 week ago';
                  if (weeks < 4) return weeks + 'w ago';
                  
                  const months = Math.floor(days / 30);
                  if (months === 1) return '1 month ago';
                  return months + 'mo ago';
                }
                
                setTimeout(() => {
                  fetch('/api/tracking?bonusId=' + bonusId)
                    .then(response => {
                      if (!response.ok) throw new Error('Failed to fetch');
                      return response.json();
                    })
                    .then(data => {
                      const lastUsedEl = document.getElementById('last-used-value');
                      const usageCountEl = document.getElementById('usage-count-value');
                      
                      if (lastUsedEl) {
                        if (data.lastUsed) {
                          lastUsedEl.innerHTML = formatTimeAgo(data.lastUsed);
                        } else {
                          lastUsedEl.innerHTML = '<span class="text-[#9ca3af]">Never used</span>';
                        }
                      }
                      
                      if (usageCountEl) {
                        const count = data.usageCount || 0;
                        usageCountEl.innerHTML = count + '<span class="text-sm text-[#9ca3af] ml-1">' + (count === 1 ? 'claim' : 'claims') + '</span>';
                      }
                    })
                    .catch(error => {
                      console.error('Error fetching usage data:', error);
                      const lastUsedEl = document.getElementById('last-used-value');
                      const usageCountEl = document.getElementById('usage-count-value');
                      
                      if (lastUsedEl) lastUsedEl.innerHTML = '<span class="text-[#9ca3af]">Unable to load</span>';
                      if (usageCountEl) usageCountEl.innerHTML = '<span class="text-[#9ca3af]">Unable to load</span>';
                    });
                }, 500);
              })();
            `
          }}
        />
      )}
    </div>
  );
} 