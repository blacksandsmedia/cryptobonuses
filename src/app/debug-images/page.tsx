'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import OptimizedImage from '@/components/OptimizedImage';

interface Casino {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
}

export default function DebugImagesPage() {
  const [casinos, setCasinos] = useState<Casino[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCasinos = async () => {
      try {
        const response = await fetch('/api/casinos');
        if (response.ok) {
          const data = await response.json();
          setCasinos(data.slice(0, 10)); // Only first 10 for testing
        }
      } catch (error) {
        console.error('Error fetching casinos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCasinos();
  }, []);

  if (loading) {
    return <div className="p-8 bg-gray-900 text-white">Loading...</div>;
  }

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Debug Images Page</h1>
      
      <div className="grid gap-8">
        {casinos.map((casino) => (
          <div key={casino.id} className="border border-gray-600 p-4 rounded">
            <h2 className="text-lg font-semibold mb-4">{casino.name}</h2>
            <p className="text-sm text-gray-400 mb-4">Logo URL: {casino.logo || 'NULL'}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Direct Next.js Image */}
              <div>
                <h3 className="text-sm font-medium mb-2">Next.js Image (Direct)</h3>
                <div className="w-16 h-16 bg-gray-800 rounded border">
                  {casino.logo ? (
                    <Image
                      src={casino.logo}
                      alt={`${casino.name} logo`}
                      width={64}
                      height={64}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        console.error(`Direct Image failed for ${casino.name}:`, casino.logo);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs">
                      No Logo
                    </div>
                  )}
                </div>
              </div>

              {/* OptimizedImage Component */}
              <div>
                <h3 className="text-sm font-medium mb-2">OptimizedImage Component</h3>
                <div className="w-16 h-16 bg-gray-800 rounded border">
                  {casino.logo ? (
                    <OptimizedImage
                      src={casino.logo}
                      alt={`${casino.name} logo`}
                      width={64}
                      height={64}
                      className="w-full h-full object-contain"
                      isLogo={true}
                      onError={() => {
                        console.error(`OptimizedImage failed for ${casino.name}:`, casino.logo);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs">
                      No Logo
                    </div>
                  )}
                </div>
              </div>

              {/* Regular img tag */}
              <div>
                <h3 className="text-sm font-medium mb-2">Regular img tag</h3>
                <div className="w-16 h-16 bg-gray-800 rounded border">
                  {casino.logo ? (
                    <img
                      src={casino.logo}
                      alt={`${casino.name} logo`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        console.error(`Regular img failed for ${casino.name}:`, casino.logo);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs">
                      No Logo
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 