'use client';

import { useState, useEffect, useCallback } from 'react';

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

// Cache for settings to avoid repeated API calls
let settingsCache: any = null;
let settingsCacheTime = 0;
const SETTINGS_CACHE_DURATION = 60000; // 1 minute

// Cache for crypto data to avoid rate limiting
let cryptoDataCache: CryptoData[] = [];
let cryptoCacheTime = 0;
const CRYPTO_CACHE_DURATION = 30000; // 30 seconds

export default function CryptoTicker() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [isHidden, setIsHidden] = useState(false);
  const [hasError, setHasError] = useState(false);

  const fetchSettings = useCallback(async () => {
    const now = Date.now();
    
    // Return cached settings if still valid
    if (settingsCache && (now - settingsCacheTime) < SETTINGS_CACHE_DURATION) {
      return settingsCache;
    }

    try {
      const response = await fetch('/api/settings', {
        cache: 'force-cache',
        next: { revalidate: 60 }
      });
      
      if (!response.ok) {
        throw new Error(`Settings API failed: ${response.status}`);
      }
      
      const settings = await response.json();
      settingsCache = settings;
      settingsCacheTime = now;
      return settings;
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      // Return default settings on error
      return {
        hideCryptoTicker: false,
        cryptoTickerSelection: [
          'BITCOIN', 'ETHEREUM', 'CARDANO', 'POLKADOT', 'DOGECOIN', 
          'LITECOIN', 'CHAINLINK', 'SOLANA', 'POLYGON', 'AVALANCHE'
        ]
      };
    }
  }, []);

  const fetchCryptoData = useCallback(async () => {
    try {
      setHasError(false);
      
      const settings = await fetchSettings();
      
      // Check if ticker should be hidden
      if (settings.hideCryptoTicker) {
        setIsHidden(true);
        setIsLoading(false);
        return;
      }

      const now = Date.now();
      
      // Return cached crypto data if still valid
      if (cryptoDataCache.length > 0 && (now - cryptoCacheTime) < CRYPTO_CACHE_DURATION) {
        setCryptoData(cryptoDataCache);
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

      // Using CoinGecko free API with timeout and retries
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinGeckoIds}&order=market_cap_desc&per_page=20&page=1&sparkline=false`,
          { 
            signal: controller.signal,
            cache: 'force-cache',
            next: { revalidate: 30 }
          }
        );
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`CoinGecko API failed: ${response.status}`);
        }

        const data = await response.json();
        
        // Validate data structure
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('Invalid or empty crypto data received');
        }

        cryptoDataCache = data;
        cryptoCacheTime = now;
        setCryptoData(data);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      setHasError(true);
      setIsLoading(false);
      
      // Use cached data if available, even if stale
      if (cryptoDataCache.length > 0) {
        setCryptoData(cryptoDataCache);
      }
    }
  }, [fetchSettings]);

  useEffect(() => {
    fetchCryptoData();
    
    // Reduced update frequency to avoid rate limiting
    const interval = setInterval(fetchCryptoData, 120000); // Update every 2 minutes

    return () => clearInterval(interval);
  }, [fetchCryptoData]);

  useEffect(() => {
    let lastScrollY = 0;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          if (currentScrollY > lastScrollY && currentScrollY > 100) {
            setIsVisible(false); // Hide when scrolling down
          } else if (currentScrollY < lastScrollY) {
            setIsVisible(true); // Show when scrolling up
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

  // Show loading state briefly, then hide if data fails to load
  if (isLoading && !hasError) {
    return (
      <div className="bg-[#2c2f3a] border-b border-[#404055] overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="flex items-center justify-center">
            <div className="animate-pulse flex items-center gap-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-[#404055] rounded-md"></div>
                  <div className="w-12 h-4 bg-[#404055] rounded"></div>
                  <div className="w-16 h-4 bg-[#404055] rounded"></div>
                  <div className="w-12 h-4 bg-[#404055] rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if no data and has error
  if (!cryptoData.length) {
    return null;
  }

  // Duplicate the data for seamless loop
  const duplicatedData = [...cryptoData, ...cryptoData];

  return (
    <div className={`bg-[#2c2f3a] border-b border-[#404055] overflow-hidden transform transition-transform duration-200 will-change-transform ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="max-w-6xl mx-auto px-4 relative">
        {/* Left fade - optimized for performance */}
        <div className="absolute -left-4 top-0 bottom-0 w-20 bg-gradient-to-r from-[#2c2f3a] via-[#2c2f3a] to-transparent z-10 pointer-events-none"></div>
        
        {/* Right fade - optimized for performance */}
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
                    // Hide broken images
                    (e.target as HTMLImageElement).style.display = 'none';
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