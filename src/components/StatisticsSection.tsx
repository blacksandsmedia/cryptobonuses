'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface StatisticsData {
  totalUsers: number;
  totalBonusesClaimed: number;
  totalOffersAvailable: number;
  mostClaimedOffer: {
    name: string;
    slug: string;
    claimCount: number;
    logoUrl?: string;
  } | null;
  totalClaimedValue: string;
}

export default function StatisticsSection() {
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch('/api/statistics');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  // Animated counter hook
  const useCounter = (end: number, duration: number = 2000) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (end === 0) return;
      
      let startTime: number;
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        setCount(Math.floor(progress * end));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }, [end, duration]);

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

  if (loading) {
    return (
      <section className="py-16 mt-16 bg-gradient-to-br from-[#2a2c36] to-[#343541]">
        <div className="mx-auto w-[90%] md:w-[95%] max-w-[1280px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="bg-[#3e4050] rounded-xl p-6 animate-pulse">
                  <div className="h-8 bg-[#4a4c5c] rounded mb-2"></div>
                  <div className="h-4 bg-[#4a4c5c] rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!stats) return null;

  const StatCard = ({ 
    title, 
    value, 
    suffix = '', 
    link = null,
    icon,
    showLogo = false,
    logoUrl
  }: { 
    title: string; 
    value: number | string; 
    suffix?: string;
    link?: string | null;
    icon: string | React.ReactElement;
    showLogo?: boolean;
    logoUrl?: string;
  }) => {
    const animatedValue = typeof value === 'number' ? useCounter(value) : value;
    
    const content = (
              <div className="bg-[#3e4050] rounded-xl p-6 hover:bg-[#434555] transition-[background-color,border-color,box-shadow,transform] duration-300 hover:scale-102 hover:shadow-lg border border-[#404055] hover:border-[#68D08B]/30 h-full will-change-transform" style={{ transform: 'translateZ(0)' }}>
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
        <a href={link} className="block">
          {content}
        </a>
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
            title="Active Offers"
            value={stats.totalOffersAvailable}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" x2="21" y1="6" y2="6"/>
                <line x1="8" x2="21" y1="12" y2="12"/>
                <line x1="8" x2="21" y1="18" y2="18"/>
                <line x1="3" x2="3.01" y1="6" y2="6"/>
                <line x1="3" x2="3.01" y1="12" y2="12"/>
                <line x1="3" x2="3.01" y1="18" y2="18"/>
              </svg>
            }
          />
          
          <StatCard
            title="Total Claimed Value"
            value={stats.totalClaimedValue}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" x2="12" y1="2" y2="22"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            }
          />
          
          {stats.mostClaimedOffer && (
            <StatCard
              title="Most Popular Casino"
              value={stats.mostClaimedOffer.name}
              link={`/${stats.mostClaimedOffer.slug}`}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
                </svg>
              }
            />
          )}
        </div>

        <div className="text-center mt-8">
          <p className="text-xs text-white/40">
            *Total claimed value calculated at $500 average per bonus claimed
          </p>
        </div>
      </div>
    </section>
  );
} 