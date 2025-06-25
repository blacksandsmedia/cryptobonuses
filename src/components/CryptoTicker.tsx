'use client';

import { useState, useEffect } from 'react';

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

export default function CryptoTicker() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [isHidden, setIsHidden] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        setError(null);
        
        // First fetch the settings to get selected cryptocurrencies and hide setting
        const settingsResponse = await fetch('/api/settings');
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

        // Using CoinGecko free API with dynamic crypto selection and enhanced error handling
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinGeckoIds}&order=market_cap_desc&per_page=20&page=1&sparkline=false`,
          {
            headers: {
              'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(10000) // 10 second timeout
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Validate data before setting it
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('CoinGecko API returned invalid or empty data');
        }
        
        setCryptoData(data);
        setRetryCount(0); // Reset retry count on success
        setIsLoading(false);
        
      } catch (error) {
        console.error('Error fetching crypto data:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        
        // If we have retries left, try again
        if (retryCount < MAX_RETRIES) {
          setRetryCount(prev => prev + 1);
          // Retry after a delay (exponential backoff)
          setTimeout(() => {
            fetchCryptoData();
          }, Math.pow(2, retryCount) * 1000); // 1s, 2s, 4s delays
          return;
        }
        
        // Max retries reached - hide the widget completely
        console.warn('Max retries reached - hiding crypto ticker');
        setCryptoData([]);
        setIsLoading(false);
      }
    };

    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [retryCount]);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          // Only show ticker when at the very top of the page (within 150px)
          if (currentScrollY <= 150) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    // Set initial visibility
    setIsVisible(window.scrollY <= 150);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Return null if ticker is hidden
  if (isHidden) {
    return null;
  }

  // Show loading state only initially
  if (isLoading && cryptoData.length === 0) {
    return null;
  }

  // If no data available, hide the widget completely
  if (cryptoData.length === 0) {
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
          <div className="animate-scroll-left flex items-center gap-8 w-fit">
            {duplicatedData.map((crypto, index) => (
              <div
                key={`${crypto.id}-${index}`}
                className="flex items-center gap-2 px-3 py-1 rounded-md whitespace-nowrap"
              >
                <img 
                  src={crypto.image} 
                  alt={crypto.name}
                  className="w-5 h-5 rounded-md"
                  onError={(e) => {
                    // Fallback to a generic crypto icon if image fails
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IiM2OEQwOEIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMmMtNS41MyAwLTEwIDQuNDctMTAgMTBzNC40NyAxMCAxMCAxMCAxMC00LjQ3IDEwLTEwUzE3LjUzIDIgMTIgMnoiLz48L3N2Zz4=';
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