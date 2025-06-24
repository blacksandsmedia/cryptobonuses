'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const UPDATE_INTERVAL = 2 * 60 * 1000; // 2 minutes
const RETRY_DELAY = 30 * 1000; // 30 seconds

export default function CryptoTicker() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [isHidden, setIsHidden] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<number>(0);
  const cacheRef = useRef<{ data: CryptoData[], timestamp: number } | null>(null);

  const fetchCryptoData = useCallback(async (isRetry = false) => {
    try {
      // Check cache first
      const now = Date.now();
      if (cacheRef.current && (now - cacheRef.current.timestamp) < CACHE_DURATION) {
        setCryptoData(cacheRef.current.data);
        setIsLoading(false);
        setError(null);
        return;
      }

      // Prevent too frequent API calls
      if (!isRetry && (now - lastFetchRef.current) < 60000) {
        return;
      }

      lastFetchRef.current = now;

      // First fetch the settings to get selected cryptocurrencies and hide setting
      const settingsResponse = await fetch('/api/settings', {
        next: { revalidate: 300 } // Cache for 5 minutes
      });
      
      if (!settingsResponse.ok) {
        throw new Error('Failed to fetch settings');
      }
      
      const settings = await settingsResponse.json();
      
      // Check if ticker should be hidden
      if (settings.hideCryptoTicker) {
        setIsHidden(true);
        setIsLoading(false);
        return;
      }
      
      const selectedCryptos = settings.cryptoTickerSelection || [
        'BITCOIN', 'ETHEREUM', 'CARDANO', 'POLKADOT', 'DOGECOIN', 
        'LITECOIN', 'CHAINLINK', 'SOLANA', 'POLYGON', 'AVALANCHE'
      ];

      // Create mapping from crypto enum to CoinGecko IDs
      const cryptoToIdMap: { [key: string]: string } = {
        'BITCOIN': 'bitcoin',
        'ETHEREUM': 'ethereum',
        'CARDANO': 'cardano',
        'POLKADOT': 'polkadot',
        'DOGECOIN': 'dogecoin',
        'LITECOIN': 'litecoin',
        'CHAINLINK': 'chainlink',
        'SOLANA': 'solana',
        'POLYGON': 'polygon-matic',
        'AVALANCHE': 'avalanche-2',
        'BINANCE_COIN': 'binancecoin',
        'RIPPLE': 'ripple',
        'TETHER': 'tether',
        'USDC': 'usd-coin',
        'TRON': 'tron',
        'MONERO': 'monero',
        'DASH': 'dash',
        'ZCASH': 'zcash',
        'STELLAR': 'stellar',
        'COSMOS': 'cosmos'
      };

      // Filter and map selected cryptos to CoinGecko IDs
      const coinGeckoIds = selectedCryptos
        .map((crypto: string) => cryptoToIdMap[crypto])
        .filter((id: string) => id) // Remove any undefined mappings
        .join(',');

      if (!coinGeckoIds) {
        console.warn('No valid cryptocurrencies selected for ticker');
        setIsLoading(false);
        return;
      }

      // Using CoinGecko free API with dynamic crypto selection
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinGeckoIds}&order=market_cap_desc&per_page=20&page=1&sparkline=false`,
        {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Invalid or empty data received from API');
      }

      // Cache the data
      cacheRef.current = { data, timestamp: now };
      
      setCryptoData(data);
      setIsLoading(false);
      setError(null);
      setRetryCount(0);
      
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      
      // Use cached data if available and not too old
      if (cacheRef.current && (Date.now() - cacheRef.current.timestamp) < (CACHE_DURATION * 2)) {
        setCryptoData(cacheRef.current.data);
        setIsLoading(false);
        setError(null);
        return;
      }
      
      setError(error instanceof Error ? error.message : 'Failed to fetch crypto data');
      setIsLoading(false);
      
      // Implement exponential backoff for retries
      if (retryCount < 3) {
        const delay = RETRY_DELAY * Math.pow(2, retryCount);
        retryTimeoutRef.current = setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchCryptoData(true);
        }, delay);
      }
    }
  }, [retryCount]);

  useEffect(() => {
    fetchCryptoData();
    
    // Set up interval for updates
    intervalRef.current = setInterval(() => {
      fetchCryptoData();
    }, UPDATE_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [fetchCryptoData]);

  useEffect(() => {
    let lastScrollY = 0;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          // Hide when scrolling down past 50px, show when scrolling up
          if (currentScrollY > lastScrollY && currentScrollY > 50) {
            setIsVisible(false); // Hide when scrolling down
          } else if (currentScrollY < lastScrollY || currentScrollY <= 50) {
            setIsVisible(true); // Show when scrolling up or at top
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Return null if ticker is hidden
  if (isHidden) {
    return null;
  }

  // Show loading state briefly, then hide if error persists
  if (isLoading && !cacheRef.current) {
    return (
      <div className={`bg-[#2c2f3a] border-b border-[#404055] transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-[#9ca3af] text-sm">Loading crypto prices...</div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if we have an error and no cached data
  if (error && (!cryptoData || cryptoData.length === 0)) {
    return null;
  }

  // Don't render if no data
  if (!cryptoData || cryptoData.length === 0) {
    return null;
  }

  // Duplicate the data for seamless loop
  const duplicatedData = [...cryptoData, ...cryptoData];

  return (
    <div className={`bg-[#2c2f3a] border-b border-[#404055] overflow-hidden transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="max-w-6xl mx-auto px-4 relative">
        {/* Left fade - extended to reach header content edges */}
        <div className="absolute -left-4 top-0 bottom-0 w-20 bg-gradient-to-r from-[#2c2f3a] via-[#2c2f3a] to-transparent z-10 pointer-events-none"></div>
        
        {/* Right fade - extended to reach header content edges */}
        <div className="absolute -right-4 top-0 bottom-0 w-20 bg-gradient-to-l from-[#2c2f3a] via-[#2c2f3a] to-transparent z-10 pointer-events-none"></div>
        
        <div className="py-2 overflow-hidden">
          <div className="animate-scroll-left flex items-center gap-8 w-fit will-change-transform">
            {duplicatedData.map((crypto, index) => (
              <div
                key={`${crypto.id}-${index}`}
                className="flex items-center gap-2 px-3 py-1 rounded-md whitespace-nowrap"
              >
                <img 
                  src={crypto.image} 
                  alt={crypto.name}
                  className="w-5 h-5 rounded-md"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="text-white font-medium text-sm">{crypto.symbol.toUpperCase()}</span>
                <span className="text-[#9ca3af] text-sm">${crypto.current_price.toLocaleString()}</span>
                <span className={`text-sm font-medium ${
                  crypto.price_change_percentage_24h >= 0 ? 'text-[#68D08B]' : 'text-red-400'
                }`}>
                  {crypto.price_change_percentage_24h >= 0 ? '+' : ''}
                  {crypto.price_change_percentage_24h.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 