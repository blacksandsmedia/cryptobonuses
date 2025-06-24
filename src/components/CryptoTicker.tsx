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

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
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

        // Using CoinGecko free API with dynamic crypto selection
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinGeckoIds}&order=market_cap_desc&per_page=20&page=1&sparkline=false`
        );
        const data = await response.json();
        setCryptoData(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching crypto data:', error);
        setIsLoading(false);
      }
    };

    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

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

  // Don't render anything while loading
  if (isLoading) {
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