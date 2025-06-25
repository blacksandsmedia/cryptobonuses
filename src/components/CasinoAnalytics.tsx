"use client";

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

interface AnalyticsData {
  casino: {
    id: string;
    name: string;
    slug: string;
  };
  stats: {
    totalBonusClaims: number;
    totalOfferClicks: number;
    totalCombinedActions: number;
    weeklyTotal: number;
    weeklyLeaderboardPosition: number;
  };
  chartData: Array<{
    date: string;
    day: string;
    count: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    bonusTitle: string;
    bonusCode?: string;
    createdAt: string;
  }>;
}

interface CasinoAnalyticsProps {
  casinoSlug: string;
  casinoName: string;
}

export default function CasinoAnalytics({ casinoSlug, casinoName }: CasinoAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const response = await fetch(`/api/casinos/${casinoSlug}/analytics`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [casinoSlug]);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const activityDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#2c2f3a] border border-[#404055] rounded-lg p-3 shadow-lg">
          <p className="text-white text-sm">{`${label}: ${payload[0].value} claims`}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <section className="bg-[#3e4050] rounded-xl px-7 py-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Bonus Activity Analytics</h2>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#2c2f3a] rounded-lg p-4 h-24"></div>
            <div className="bg-[#2c2f3a] rounded-lg p-4 h-24"></div>
            <div className="bg-[#2c2f3a] rounded-lg p-4 h-24"></div>
          </div>
          <div className="bg-[#2c2f3a] rounded-lg h-64"></div>
        </div>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="bg-[#3e4050] rounded-xl px-7 py-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Bonus Activity Analytics</h2>
        <div className="text-center py-8">
          <p className="text-[#a7a9b4] mb-4">Unable to load analytics data</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-[#68D08B] hover:text-[#7ee3a3] transition-colors"
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="analytics" className="bg-[#3e4050] rounded-xl px-7 py-6 sm:p-8">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold">Bonus Activity Analytics</h2>
      </div>
      
      <p className="text-[#a7a9b4] mb-4 text-base">
        Live tracking showing recent bonus activity and community engagement at {casinoName}.
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#2c2f3a] rounded-lg p-4 border border-[#404055]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#a7a9b4] text-sm">Total Claims</p>
              <p className="text-2xl font-bold text-white">{data.stats.totalCombinedActions}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#2c2f3a] rounded-lg p-4 border border-[#404055]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#a7a9b4] text-sm">This Week</p>
              <p className="text-2xl font-bold text-white">{data.stats.weeklyTotal}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#2c2f3a] rounded-lg p-4 border border-[#404055]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#a7a9b4] text-sm">Weekly Rank</p>
              <p className="text-2xl font-bold text-white">#{data.stats.weeklyLeaderboardPosition}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-[#2c2f3a] rounded-lg p-6 border border-[#404055] mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Claims Last 7 Days</h3>
          <div className="text-[#68D08B] text-sm font-medium">
            {data.chartData.reduce((sum, item) => sum + item.count, 0)} total claims
          </div>
        </div>
        
        <div className="h-64 bg-[#343541] rounded-lg">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={data.chartData}
              margin={{ 
                top: typeof window !== 'undefined' && window.innerWidth < 768 ? 30 : 40, 
                right: typeof window !== 'undefined' && window.innerWidth < 768 ? 35 : 45, 
                left: typeof window !== 'undefined' && window.innerWidth < 768 ? 35 : 45, 
                bottom: typeof window !== 'undefined' && window.innerWidth < 768 ? 35 : 45 
              }}
            >
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#68D08B" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#68D08B" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ 
                  fill: '#9ca3af', 
                  fontSize: typeof window !== 'undefined' && window.innerWidth < 768 ? 10 : 11,
                  fontWeight: 500
                }}
                interval={0}
                tickMargin={typeof window !== 'undefined' && window.innerWidth < 768 ? 8 : 10}
                height={typeof window !== 'undefined' && window.innerWidth < 768 ? 30 : 40}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ 
                  fill: '#9ca3af', 
                  fontSize: typeof window !== 'undefined' && window.innerWidth < 768 ? 10 : 12,
                  fontWeight: 500
                }}
                domain={[0, 'dataMax + 1']}
                tickFormatter={(value) => Math.round(value).toString()}
                allowDecimals={false}
                tickMargin={typeof window !== 'undefined' && window.innerWidth < 768 ? 8 : 15}
                width={typeof window !== 'undefined' && window.innerWidth < 768 ? 20 : 25}
              />
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#404055" 
                horizontal={true}
                vertical={false}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ stroke: '#68D08B', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#68D08B" 
                strokeWidth={3}
                dot={{ 
                  fill: '#68D08B', 
                  strokeWidth: 2, 
                  r: 5,
                  stroke: '#2c2f3a'
                }}
                activeDot={{ 
                  r: 7, 
                  stroke: '#68D08B', 
                  strokeWidth: 3,
                  fill: '#68D08B',
                  filter: 'drop-shadow(0 0 6px rgba(104, 208, 139, 0.4))'
                }}
                fill="url(#colorGradient)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Chart Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#68D08B] rounded-full"></div>
            <span className="text-[#9ca3af] text-sm font-medium">Daily Claims</span>
          </div>
          <div className="text-[#6b7280] text-xs">
            Peak: {Math.max(...data.chartData.map(d => d.count))} claims
          </div>
        </div>
      </div>

      {/* Live Feed */}
      <div className="bg-[#2c2f3a] rounded-lg p-6 border border-[#404055]">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-[#68D08B] rounded-full animate-pulse"></div>
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        </div>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {data.recentActivity.length > 0 ? (
            data.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 bg-[#343541] rounded-lg">
                <div className="w-8 h-8 bg-[#68D08B]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#68D08B]">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm">
                    Someone claimed{' '}
                    <span className="text-[#68D08B] font-semibold">{activity.bonusTitle}</span>
                    {activity.bonusCode && (
                      <span className="text-[#a7a9b4]"> with code </span>
                    )}
                    {activity.bonusCode && (
                      <span className="text-[#68D08B] font-semibold">{activity.bonusCode}</span>
                    )}
                  </p>
                </div>
                <div className="text-[#a7a9b4] text-xs whitespace-nowrap">
                  {formatTimeAgo(activity.createdAt)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-[#a7a9b4] text-sm">No recent activity to display</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-xs text-[#a7a9b4] text-center">
        Analytics updated in real-time • Last updated {new Date().toLocaleTimeString()}
      </div>
    </section>
  );
} 