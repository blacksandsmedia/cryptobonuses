'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from '@/contexts/TranslationContext';
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

interface RecentPageChecksProps {
  pageSlug: string;
  casinoName: string;
  pageType?: string;
}

export default function RecentPageChecks({ pageSlug, casinoName, pageType = 'casino' }: RecentPageChecksProps) {
  const [pageChecks, setPageChecks] = useState<PageCheck[]>([]);
  const [loading, setLoading] = useState(true);

  // Add translation support with fallback
  let t;
  try {
    const translation = useTranslation();
    t = translation.t;
  } catch {
    // Not in translation context, use fallback
    t = (key: string) => key.split('.').pop() || key;
  }

  useEffect(() => {
    async function fetchPageChecks() {
      try {
        const response = await fetch(`/api/page-checks/${pageSlug}`);
        const data = await response.json();
        
        if (data.success) {
          setPageChecks(data.data);
        }
      } catch (error) {
        console.error('Error fetching page checks:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPageChecks();
  }, [pageSlug]);

  if (loading) {
    return (
      <section className="bg-[#3e4050] rounded-xl px-7 py-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Updates from Checks</h2>
        <div className="animate-pulse">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#404055] rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-[#404055] rounded w-3/4"></div>
                </div>
                <div className="h-3 bg-[#404055] rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (pageChecks.length === 0) {
    return null; // Don't show the component if there are no checks
  }

  const getDisplayName = (user: User) => {
    if (user.name) return user.name;
    return `User${user.id.slice(-4)}`;
  };

  const getUserAvatar = (user: User) => {
    if (user.profilePicture) return user.profilePicture;
    if (user.image) return user.image;
    return null;
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  return (
    <section className="bg-[#3e4050] rounded-xl px-7 py-6 sm:p-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">{t('casino.recent') || 'Recent'} {casinoName} {t('casino.updates') || 'Updates'}</h2>
      <div className="space-y-3">
        {pageChecks.slice(0, 3).map((check) => {
          const avatar = getUserAvatar(check.user);
          const displayName = getDisplayName(check.user);
          
          return (
            <div key={check.id} className="flex items-center gap-3 p-3 bg-[#2c2f3a] rounded-lg border border-[#404055]/30">
              {/* User Avatar */}
              <div className="flex-shrink-0">
                {avatar ? (
                  <Image
                    src={avatar}
                    alt={`${displayName} avatar`}
                    width={32}
                    height={32}
                    className="rounded-full object-cover border border-[#404055]"
                  />
                ) : (
                  <div className="w-8 h-8 bg-[#68D08B]/20 rounded-full flex items-center justify-center border border-[#68D08B]/30">
                    <svg className="w-4 h-4 text-[#68D08B]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Check Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">
                  {check.user.username ? (
                    <Link 
                      href={`/user/${check.user.username}`}
                      className="font-medium text-[#68D08B] hover:text-[#5bc47d] cursor-pointer transition-colors duration-200"
                    >
                      {displayName}
                    </Link>
                  ) : (
                    <span className="font-medium text-[#68D08B]">
                      {displayName}
                    </span>
                  )}
                  <span className="text-[#a7a9b4]"> {t('casino.checkedThisPage') || 'checked this page'}</span>
                  {check.notes && !check.isAutomatic && !check.notes.includes('Weekly automatic check') && (
                    <span className="text-[#a7a9b4] block text-xs mt-1 italic">"{check.notes}"</span>
                  )}
                </p>
              </div>

              {/* Time */}
              <div className="flex-shrink-0">
                <span className="text-xs text-[#a7a9b4]">
                  {formatTimeAgo(check.createdAt)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
} 