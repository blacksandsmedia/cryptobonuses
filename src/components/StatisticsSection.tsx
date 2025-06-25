'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Statistics {
  totalUsers: number;
  totalBonusesClaimed: number;
  activeCasinos: number;
  totalOffersAvailable: number;
  mostClaimedBonus?: {
    title: string;
    casinoName: string;
    casinoLogo?: string;
  };
}

export default function StatisticsSection() {
  const [stats, setStats] = useState<Statistics>({
    totalUsers: 0,
    totalBonusesClaimed: 0,
    activeCasinos: 0,
    totalOffersAvailable: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/statistics', {
          cache: 'force-cache',
          next: { revalidate: 300 } // Cache for 5 minutes
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const useCounter = (end: number, duration: number = 2000) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (loading || end === 0) return;

      let start = 0;
      const increment = end / (duration / 16); // 60fps
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }, [end, duration, loading]);

    return count;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode | string;
    suffix?: string;
    link?: string;
    logoUrl?: string;
    showLogo?: boolean;
  }

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    suffix = '', 
    link, 
    logoUrl, 
    showLogo = false 
  }: StatCardProps) => {
    const animatedValue = typeof value === 'number' ? useCounter(value) : value;
    
    const content = (
      <div className="bg-[#3e4050] rounded-xl p-6 border border-[#404055] card-hover h-full">
        <div className="text-center flex flex-col items-center justify-center h-full">
          {showLogo && logoUrl ? (
            <div className="w-8 h-8 mx-auto mb-3 rounded-md overflow-hidden bg-[#2c2f3a] flex items-center justify-center flex-shrink-0">
              <img 
                src={logoUrl} 
                alt={`${value} logo`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="text-lg hidden">{typeof icon === 'string' ? icon : <div className="text-white">{icon}</div>}</div>
            </div>
          ) : (
            <div className="mb-3 text-white flex justify-center flex-shrink-0">
              {typeof icon === 'string' ? <div className="text-2xl">{icon}</div> : icon}
            </div>
          )}
          <div className="text-2xl md:text-3xl font-bold text-[#68D08B] mb-2 text-center">
            {typeof animatedValue === 'number' ? formatNumber(animatedValue) : animatedValue}{suffix}
          </div>
          <div className="text-sm text-white/70 leading-tight text-center">{title}</div>
        </div>
      </div>
    );

    if (link) {
      return (
        <Link href={link} className="block optimized-hover">
          {content}
        </Link>
      );
    }

    return content;
  };

  return (
    <section className="py-16 mt-16 bg-gradient-to-br from-[#2a2c36] to-[#343541]">
      <div className="mx-auto w-[90%] md:w-[95%] max-w-[1280px]">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            CryptoBonuses by the Numbers
          </h2>
          <p className="text-[#a4a5b0] text-lg max-w-2xl mx-auto">
            Join thousands of players who trust CryptoBonuses to find the best crypto casino offers
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            }
          />
          
          <StatCard
            title="Bonuses Claimed"
            value={stats.totalBonusesClaimed}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            }
          />
          
          <StatCard
            title="Active Casinos"
            value={stats.activeCasinos}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            }
          />
          
          <StatCard
            title="Total Offers"
            value={stats.totalOffersAvailable}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
              </svg>
            }
          />
          
          {stats.mostClaimedBonus && (
            <StatCard
              title="Most Popular"
              value={stats.mostClaimedBonus.title}
              icon="🏆"
              logoUrl={stats.mostClaimedBonus.casinoLogo}
              showLogo={!!stats.mostClaimedBonus.casinoLogo}
            />
          )}
        </div>
      </div>
    </section>
  );
} 