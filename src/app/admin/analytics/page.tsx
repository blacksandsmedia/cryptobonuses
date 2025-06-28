"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { normalizeImagePath } from "@/lib/image-utils";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { BarChart3, Clock, ArrowDownUp, ArrowUp, BarChart2, PieChart, RefreshCw } from "lucide-react";
import { CASINO_COLORS } from "@/lib/constants";
import TimeframeSelector from "./TimeframeSelector";

// Interfaces
interface Bonus {
  id: string;
  title: string;
  code: string | null;
  type: string;
  value: string;
  copies: number;
  clicks: number;
}

interface Casino {
  id: string;
  name: string;
  slug: string;
  logo: string;
  totalActions: number;
  copies: number;
  clicks: number;
  bonuses: Bonus[];
}

interface DailyActivity {
  date: string;
  copies: number;
  clicks: number;
  total: number;
}

interface RecentActivity {
  id: string;
  casinoName: string;
  casinoSlug: string;
  casinoLogo: string;
  actionType: string;
  createdAt: string;
  bonusTitle: string;
  bonusCode: string | null;
}

interface AnalyticsData {
  overall: {
    totalActions: number;
    totalCopies: number;
    totalClicks: number;
  };
  casinoAnalytics: Casino[];
  dailyActivity: DailyActivity[];
  recentActivity: RecentActivity[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("today");
  const [selectedCasinoId, setSelectedCasinoId] = useState<string | null>(null);
  const [casinoDetailData, setCasinoDetailData] = useState<any | null>(null);
  const [casinoDetailLoading, setCasinoDetailLoading] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [wipingData, setWipingData] = useState<boolean>(false);
  const [visibleActivityItems, setVisibleActivityItems] = useState<number>(5);
  const [visibleCasinoActivityItems, setVisibleCasinoActivityItems] = useState<number>(5);
  const [activityPage, setActivityPage] = useState<number>(1);
  const [casinoActivityPage, setCasinoActivityPage] = useState<number>(1);
  const [activityPageSize, setActivityPageSize] = useState<number>(5);
  const [casinoActivityPageSize, setCasinoActivityPageSize] = useState<number>(5);
  const [customStartDate, setCustomStartDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [customEndDate, setCustomEndDate] = useState<Date>(new Date());
  const router = useRouter();
  const REFRESH_INTERVAL = 30000; // 30 seconds
  const DEFAULT_ACTIVITY_ITEMS = 5;
  const LOAD_MORE_INCREMENT = 10; // Show 10 more items at a time

  const fetchData = async () => {
    try {
      const timestamp = Date.now();
      // Add custom date parameters if using custom timeframe
      let url = `/api/analytics?timeframe=${timeframe}&refresh=true&_=${timestamp}`;
      if (timeframe === 'custom') {
        url += `&startDate=${customStartDate.toISOString()}&endDate=${customEndDate.toISOString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }
      const analyticsData = await response.json();
      setData(analyticsData);
      setLastRefreshed(new Date());
      
      // Reset pagination when new data is loaded
      setActivityPage(1);
      setVisibleActivityItems(DEFAULT_ACTIVITY_ITEMS);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();

    // Reset casino detail view when timeframe changes
    setSelectedCasinoId(null);
    setCasinoDetailData(null);

    // Set up visibility change listener to refresh when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [timeframe, customStartDate, customEndDate]);

  const fetchCasinoDetails = async (casinoId: string) => {
    setCasinoDetailLoading(true);
    try {
      const timestamp = Date.now();
      // Add custom date parameters if using custom timeframe
      let url = `/api/analytics?timeframe=${timeframe}&casinoId=${casinoId}&refresh=true&_=${timestamp}`;
      if (timeframe === 'custom') {
        url += `&startDate=${customStartDate.toISOString()}&endDate=${customEndDate.toISOString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch casino analytics data");
      }
      const casinoData = await response.json();
      setCasinoDetailData(casinoData);
      setSelectedCasinoId(casinoId);
      setLastRefreshed(new Date());
      
      // Reset pagination when new data is loaded
      setCasinoActivityPage(1);
      setVisibleCasinoActivityItems(DEFAULT_ACTIVITY_ITEMS);
      
      // Auto-scroll to the top of the page when showing casino details
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Error fetching casino analytics data:", error);
    } finally {
      setCasinoDetailLoading(false);
    }
  };

  // Memoize the fetch function
  const memoizedFetchData = useCallback(fetchData, [timeframe, customStartDate, customEndDate]);

  // Initial data fetch
  useEffect(() => {
    memoizedFetchData();
  }, [memoizedFetchData]);

  const handleTimeframeChange = (newTimeframe: string) => {
    // Show loading immediately for better UX
    setLoading(true);
    setTimeframe(newTimeframe);
    // Reset pagination when timeframe changes
    setActivityPage(1);
    setVisibleActivityItems(DEFAULT_ACTIVITY_ITEMS);
    setCasinoActivityPage(1);
    setVisibleCasinoActivityItems(DEFAULT_ACTIVITY_ITEMS);
  };

  const handleCustomDateChange = (startDate: Date, endDate: Date) => {
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
  };

  const resetCustomDates = () => {
    setCustomStartDate(new Date(new Date().setDate(new Date().getDate() - 7)));
    setCustomEndDate(new Date());
  };

  const handleRefresh = () => {
    if (selectedCasinoId) {
      fetchCasinoDetails(selectedCasinoId);
    } else {
      fetchData();
    }
  };

  const handleWipeData = async () => {
    // Show confirmation before wiping
    if (!confirm("Are you sure you want to delete ALL analytics data? This action cannot be undone.")) {
      return;
    }

    setWipingData(true);
    try {
      // Make sure to include credentials to send cookies (both nextauth.session-token and admin-token)
      const response = await fetch('/api/analytics/wipe', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // This ensures cookies are sent with the request
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Wipe analytics error:", response.status, errorData);
        throw new Error(errorData.error || `Failed to wipe analytics data (${response.status})`);
      }

      const result = await response.json();
      // Refresh data after wiping
      await memoizedFetchData();
      alert(result.message || "Analytics data successfully wiped");
    } catch (error) {
      console.error("Error wiping analytics data:", error);
      alert(error.message || "Failed to wipe analytics data");
    } finally {
      setWipingData(false);
    }
  };

  const handleBackToDashboard = () => {
    setSelectedCasinoId(null);
    setCasinoDetailData(null);
    setVisibleActivityItems(DEFAULT_ACTIVITY_ITEMS); // Reset when going back to dashboard
    setVisibleCasinoActivityItems(DEFAULT_ACTIVITY_ITEMS); // Reset when going back to dashboard
    fetchData(); // Refresh the main dashboard data
  };

  const renderOverviewStats = () => {
    if (!data) return null;
    
    // Find the casino with the most actions (top offer)
    const topCasino = data.casinoAnalytics.length > 0 ? data.casinoAnalytics[0] : null;
    
    return (
      <div className="admin-grid">
        <div className="admin-card">
          <div className="text-[#a7a9b4] text-sm">Total Actions</div>
          <div className="text-white text-xl sm:text-2xl font-bold mt-1">
            {data.overall.totalActions}
          </div>
        </div>
        <div className="admin-card">
          <div className="text-[#a7a9b4] text-sm">Code Copies</div>
          <div className="text-white text-xl sm:text-2xl font-bold mt-1">
            {data.overall.totalCopies}
          </div>
        </div>
        <div className="admin-card">
          <div className="text-[#a7a9b4] text-sm">Offer Clicks</div>
          <div className="text-white text-xl sm:text-2xl font-bold mt-1">
            {data.overall.totalClicks}
          </div>
        </div>
        <div className="admin-card">
          <div className="text-[#a7a9b4] text-sm">Top Offer</div>
          <div className="text-white text-xl sm:text-2xl font-bold mt-1 truncate">
            {topCasino ? topCasino.name : 'N/A'}
          </div>
        </div>
      </div>
    );
  };

  const renderCasinoTable = () => {
    if (!data?.casinoAnalytics || data.casinoAnalytics.length === 0) {
      return <p className="text-[#a7a9b4] text-center py-8">No casino data available</p>;
    }

    return (
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr className="bg-[#373946] text-[#a7a9b4]">
              <th className="admin-table-th-mobile">Casino</th>
              <th className="admin-table-th-mobile text-right">Total</th>
              <th className="admin-table-th-mobile text-right hidden sm:table-cell">Copies</th>
              <th className="admin-table-th-mobile text-right hidden sm:table-cell">Clicks</th>
              <th className="admin-table-th-mobile text-center">Details</th>
            </tr>
          </thead>
          <tbody>
            {data.casinoAnalytics.map((casino) => (
              <tr 
                key={casino.id} 
                className="border-b border-[#404055] hover:bg-[#323240] cursor-pointer"
                onClick={() => fetchCasinoDetails(casino.id)}
              >
                <td className="admin-table-td-mobile">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 relative flex-shrink-0">
                      {casino.logo ? (
                        <Image
                          src={normalizeImagePath(casino.logo)}
                          alt={casino.name}
                          width={24}
                          height={24}
                          className="rounded-md object-contain sm:w-8 sm:h-8"
                        />
                      ) : (
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-700 rounded-md flex items-center justify-center">
                          <span className="text-xs">{casino.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-white text-sm sm:text-base truncate">{casino.name}</span>
                  </div>
                </td>
                <td className="admin-table-td-mobile text-right text-white text-sm sm:text-base">{casino.totalActions}</td>
                <td className="admin-table-td-mobile text-right text-white text-sm sm:text-base hidden sm:table-cell">{casino.copies}</td>
                <td className="admin-table-td-mobile text-right text-white text-sm sm:text-base hidden sm:table-cell">{casino.clicks}</td>
                <td className="admin-table-td-mobile text-center">
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 sm:px-3 rounded text-xs sm:text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchCasinoDetails(casino.id);
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderActivityChart = () => {
    if (!data?.dailyActivity || data.dailyActivity.length === 0) {
      return <p className="text-gray-400 h-64 flex items-center justify-center">No activity data available</p>;
    }

    return (
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data.dailyActivity}
            margin={{ 
              top: typeof window !== 'undefined' && window.innerWidth < 768 ? 20 : 25, 
              right: typeof window !== 'undefined' && window.innerWidth < 768 ? 30 : 35, 
              left: typeof window !== 'undefined' && window.innerWidth < 768 ? 30 : 35, 
              bottom: typeof window !== 'undefined' && window.innerWidth < 768 ? 40 : 25 
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#404055" />
            <XAxis 
              dataKey="date" 
              tick={{ 
                fill: '#a7a9b4', 
                fontSize: typeof window !== 'undefined' && window.innerWidth < 768 ? 10 : 12 
              }}
              angle={typeof window !== 'undefined' && window.innerWidth < 768 ? -30 : 0}
              textAnchor={typeof window !== 'undefined' && window.innerWidth < 768 ? "end" : "middle"}
              height={typeof window !== 'undefined' && window.innerWidth < 768 ? 50 : 30}
              interval={typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 0}
              tickFormatter={(value) => {
                const date = new Date(value);
                const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
                if (isMobile) {
                  return date.toLocaleDateString('en-GB', { 
                    day: '2-digit',
                    month: '2-digit',
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                  });
                }
                return date.toLocaleDateString('en-GB', { 
                  day: 'numeric', 
                  month: 'short',
                  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                });
              }}
              tickMargin={typeof window !== 'undefined' && window.innerWidth < 768 ? 5 : 10}
            />
            <YAxis tick={{ fill: '#a7a9b4' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#2b2d36', borderColor: '#404055', color: '#fff' }}
              labelStyle={{ color: '#fff' }}
              formatter={(value: any) => [`${value}`, '']}
              labelFormatter={(label) => {
                // Use the standardized formatDateTime function
                return formatDateTime(label);
              }}
            />
            <Legend wrapperStyle={{ color: '#a7a9b4' }} />
            <Line 
              type="monotone" 
              dataKey="copies" 
              stroke="#3b82f6" 
              name="Code Copies" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="clicks" 
              stroke="#10b981" 
              name="Offer Clicks" 
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="#f59e0b" 
              name="Total Actions"
              strokeWidth={2} 
              dot={{ fill: '#f59e0b', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderActionType = (actionType: string) => {
    switch (actionType) {
      case "code_copy":
        return "Copied code";
      case "offer_click":
        return "Clicked offer";
      case "page_view":
        return "Viewed page";
      case "test":
        return "Test action";
      default:
        return actionType;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }) + ' - ' + date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  };

  const renderRecentActivity = () => {
    if (!data?.recentActivity || data.recentActivity.length === 0) {
      return <p className="text-gray-400">No recent activity available</p>;
    }

    // Calculate pagination values
    const totalItems = data.recentActivity.length;
    const totalPages = Math.ceil(totalItems / activityPageSize);
    const startIndex = (activityPage - 1) * activityPageSize;
    const endIndex = Math.min(startIndex + activityPageSize, totalItems);
    
    // Get current page items
    const displayedActivity = data.recentActivity.slice(startIndex, endIndex);

    return (
      <div className="space-y-3 mt-4">
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm text-gray-400">
            Showing {startIndex + 1}-{endIndex} of {totalItems} events
          </div>
          <div className="flex items-center space-x-2">
            <select 
              className="bg-[#2b2d36] text-white text-sm p-1 rounded border border-[#444657]"
              value={activityPageSize}
              onChange={(e) => {
                const newSize = parseInt(e.target.value);
                setActivityPageSize(newSize);
                setActivityPage(1); // Reset to first page when changing page size
              }}
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
          </div>
        </div>

        {displayedActivity.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between bg-[#2b2d36] p-3 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 relative rounded-md overflow-hidden flex-shrink-0">
                {activity.casinoLogo ? (
                  <Image
                    src={normalizeImagePath(activity.casinoLogo)}
                    alt={activity.casinoName}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-700 flex items-center justify-center">
                    <span className="text-xs">{activity.casinoName.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div>
                <div className="text-white font-medium">{activity.casinoName}</div>
                <div className="text-sm text-[#a7a9b4]">
                  {renderActionType(activity.actionType)}:
                  {activity.bonusCode ? ` ${activity.bonusCode}` : ` ${activity.bonusTitle}`}
                </div>
              </div>
            </div>
            <div className="text-[#a7a9b4] text-sm">
              {formatDateTime(activity.createdAt)}
            </div>
          </div>
        ))}
        
        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <button 
              onClick={() => setActivityPage(prev => Math.max(prev - 1, 1))}
              disabled={activityPage === 1}
              className={`px-3 py-1 rounded ${activityPage === 1 ? 'bg-[#2b2d36] text-gray-500' : 'bg-[#373946] hover:bg-[#444657] text-white'}`}
            >
              Previous
            </button>
            <div className="text-sm text-white">
              Page {activityPage} of {totalPages}
            </div>
            <button 
              onClick={() => setActivityPage(prev => Math.min(prev + 1, totalPages))}
              disabled={activityPage === totalPages}
              className={`px-3 py-1 rounded ${activityPage === totalPages ? 'bg-[#2b2d36] text-gray-500' : 'bg-[#373946] hover:bg-[#444657] text-white'}`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderCasinoDetail = () => {
    if (!casinoDetailData) return null;
    const casinoDetails = casinoDetailData.casinoDetails;
    const bonuses = casinoDetailData.bonusDetails;
    const analytics = casinoDetailData.analytics;
    
    // Helper function to calculate percentage
    const calculatePercentage = (part: number, total: number) => {
      if (total === 0) return 0;
      return Math.round((part / total) * 100);
    };

    // Calculate pagination values for casino activity
    const totalCasinoItems = analytics.recentActivity ? analytics.recentActivity.length : 0;
    const totalCasinoPages = Math.ceil(totalCasinoItems / casinoActivityPageSize);
    const startCasinoIndex = (casinoActivityPage - 1) * casinoActivityPageSize;
    const endCasinoIndex = Math.min(startCasinoIndex + casinoActivityPageSize, totalCasinoItems);
    
    // Get current page items for casino activity
    const displayedCasinoActivity = analytics.recentActivity ? 
      analytics.recentActivity.slice(startCasinoIndex, endCasinoIndex) : [];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                setSelectedCasinoId(null);
                setCasinoDetailData(null);
                setVisibleActivityItems(DEFAULT_ACTIVITY_ITEMS);
                setVisibleCasinoActivityItems(DEFAULT_ACTIVITY_ITEMS);
                setActivityPage(1);
                setCasinoActivityPage(1);
              }}
              className="bg-[#373946] p-2 rounded-lg hover:bg-[#3c3f4a]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="bg-[#2b2d36] p-2 rounded-lg">
              <img 
                src={casinoDetails.logo} 
                alt={casinoDetails.name} 
                className="w-16 h-16 object-contain"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{casinoDetails.name}</h3>
              <div className="text-[#a7a9b4] text-sm">
                Rating: {casinoDetails.rating ? `${casinoDetails.rating.toFixed(1)}/5` : '0.0/5'} | {casinoDetails.website || "No website provided"}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#2b2d36] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Total Actions</h4>
            <div className="text-3xl text-white font-bold">{analytics.totalActions}</div>
          </div>
          <div className="bg-[#2b2d36] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Copies</h4>
            <div className="text-3xl text-white font-bold">{analytics.totalCopies}</div>
          </div>
          <div className="bg-[#2b2d36] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Clicks</h4>
            <div className="text-3xl text-white font-bold">{analytics.totalClicks}</div>
          </div>
        </div>

        {/* Recent Activity Section with same styling as main view - Moved above the chart */}
        <div className="bg-[#1e1f28] p-5 rounded-lg border border-[#343747]">
          <h4 className="text-xl font-semibold text-white mb-4">Recent Activity</h4>
          {analytics.recentActivity && analytics.recentActivity.length > 0 ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm text-gray-400">
                  Showing {startCasinoIndex + 1}-{endCasinoIndex} of {totalCasinoItems} events
                </div>
                <div className="flex items-center space-x-2">
                  <select 
                    className="bg-[#2b2d36] text-white text-sm p-1 rounded border border-[#444657]"
                    value={casinoActivityPageSize}
                    onChange={(e) => {
                      const newSize = parseInt(e.target.value);
                      setCasinoActivityPageSize(newSize);
                      setCasinoActivityPage(1); // Reset to first page when changing page size
                    }}
                  >
                    <option value="5">5 per page</option>
                    <option value="10">10 per page</option>
                    <option value="25">25 per page</option>
                    <option value="50">50 per page</option>
                    <option value="100">100 per page</option>
                  </select>
                </div>
              </div>
            
              {displayedCasinoActivity.map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-center justify-between bg-[#2b2d36] p-3 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 relative rounded-md overflow-hidden flex-shrink-0">
                      {casinoDetails.logo ? (
                        <Image
                          src={normalizeImagePath(casinoDetails.logo)}
                          alt={casinoDetails.name}
                          width={40}
                          height={40}
                          className="object-contain"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-700 flex items-center justify-center">
                          <span className="text-xs">{casinoDetails.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-white font-medium">{casinoDetails.name}</div>
                      <div className="text-sm text-[#a7a9b4]">
                        {renderActionType(activity.actionType)}:
                        {activity.bonusCode ? ` ${activity.bonusCode}` : ` ${activity.bonusTitle}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-[#a7a9b4] text-sm">
                    {formatDateTime(activity.createdAt)}
                  </div>
                </div>
              ))}
              
              {/* Pagination controls for casino activity */}
              {totalCasinoPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <button 
                    onClick={() => setCasinoActivityPage(prev => Math.max(prev - 1, 1))}
                    disabled={casinoActivityPage === 1}
                    className={`px-3 py-1 rounded ${casinoActivityPage === 1 ? 'bg-[#2b2d36] text-gray-500' : 'bg-[#373946] hover:bg-[#444657] text-white'}`}
                  >
                    Previous
                  </button>
                  <div className="text-sm text-white">
                    Page {casinoActivityPage} of {totalCasinoPages}
                  </div>
                  <button 
                    onClick={() => setCasinoActivityPage(prev => Math.min(prev + 1, totalCasinoPages))}
                    disabled={casinoActivityPage === totalCasinoPages}
                    className={`px-3 py-1 rounded ${casinoActivityPage === totalCasinoPages ? 'bg-[#2b2d36] text-gray-500' : 'bg-[#373946] hover:bg-[#444657] text-white'}`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[#a7a9b4]">No recent activity for this casino</p>
          )}
        </div>

        {/* Daily Activity section */}
        <div className="bg-[#2b2d36] p-4 rounded-lg">
          <h4 className="text-white font-medium mb-3">Daily Activity</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={analytics.dailyActivity}
                margin={{ 
                  top: typeof window !== 'undefined' && window.innerWidth < 768 ? 20 : 25, 
                  right: typeof window !== 'undefined' && window.innerWidth < 768 ? 30 : 35, 
                  left: typeof window !== 'undefined' && window.innerWidth < 768 ? 30 : 35, 
                  bottom: typeof window !== 'undefined' && window.innerWidth < 768 ? 40 : 25 
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#404055" />
                <XAxis 
                  dataKey="date" 
                  tick={{ 
                    fill: '#a7a9b4', 
                    fontSize: typeof window !== 'undefined' && window.innerWidth < 768 ? 10 : 12 
                  }}
                  angle={typeof window !== 'undefined' && window.innerWidth < 768 ? -30 : 0}
                  textAnchor={typeof window !== 'undefined' && window.innerWidth < 768 ? "end" : "middle"}
                  height={typeof window !== 'undefined' && window.innerWidth < 768 ? 50 : 30}
                  interval={typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 0}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
                    if (isMobile) {
                      return date.toLocaleDateString('en-GB', { 
                        day: '2-digit',
                        month: '2-digit',
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                      });
                    }
                    return date.toLocaleDateString('en-GB', { 
                      day: 'numeric', 
                      month: 'short',
                      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                    });
                  }}
                  tickMargin={typeof window !== 'undefined' && window.innerWidth < 768 ? 5 : 10}
                />
                <YAxis tick={{ fill: '#a7a9b4' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#2b2d36', borderColor: '#404055', color: '#fff' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value: any) => [`${value}`, '']}
                  labelFormatter={(label) => {
                    // Use the standardized formatDateTime function
                    return formatDateTime(label);
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#8884d8" 
                  name="Total" 
                  activeDot={{ r: 8 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="copies" 
                  stroke="#68D08B" 
                  name="Copies" 
                />
                <Line 
                  type="monotone" 
                  dataKey="clicks" 
                  stroke="#82ca9d" 
                  name="Clicks" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <div className="flex items-center space-x-4">
          <TimeframeSelector 
            value={timeframe} 
            onChange={handleTimeframeChange} 
            onCustomDateChange={handleCustomDateChange}
            startDate={customStartDate}
            endDate={customEndDate}
            resetCustomDates={resetCustomDates}
          />
          <div className="flex items-center space-x-2">
            <button 
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg flex items-center gap-1"
              onClick={handleRefresh}
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                <path d="M21 3v5h-5"></path>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                <path d="M3 21v-5h5"></path>
              </svg>
              Refresh
            </button>
            <button 
              className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg flex items-center gap-1"
              onClick={handleWipeData}
              disabled={wipingData || loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
              Wipe Data
            </button>
          </div>
        </div>
      </div>
      
      {/* Show date range for custom timeframe */}
      {timeframe === 'custom' && (
        <div className="mb-4 text-sm text-white bg-[#2b2d36] p-2 rounded-lg inline-block">
          Viewing data from {customStartDate.toLocaleDateString('en-GB')} to {customEndDate.toLocaleDateString('en-GB')}
        </div>
      )}
      
      {lastRefreshed && (
        <div className="text-xs text-gray-400 mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg> 
          Last updated: {formatDateTime(lastRefreshed.toString())}
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : selectedCasinoId && casinoDetailData ? (
        renderCasinoDetail()
      ) : (
        <div className="space-y-6">
          {renderOverviewStats()}
          
          {/* Recent Activity Section - Moved above the chart */}
          <div className="bg-[#1e1f28] p-5 rounded-lg border border-[#343747]">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
            {renderRecentActivity()}
          </div>
          
          {/* Activity Over Time Section */}
          <div className="bg-[#1e1f28] p-5 rounded-lg border border-[#343747]">
            <h2 className="text-xl font-semibold text-white mb-4">Activity Over Time</h2>
            {renderActivityChart()}
          </div>
          
          {/* Casino Performance Section */}
          <div className="bg-[#1e1f28] p-5 rounded-lg border border-[#343747]">
            <h2 className="text-xl font-semibold text-white mb-4">Casino Performance</h2>
            {renderCasinoTable()}
          </div>
        </div>
      )}

      <style jsx global>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
} 