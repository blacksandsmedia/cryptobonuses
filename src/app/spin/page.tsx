import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import SpinWheel from '@/components/SpinWheel';
import Link from 'next/link';
import { getCodeTermLabel } from '@/lib/settings';

export const metadata: Metadata = {
  title: 'Crypto Bonus Spin Wheel - Win Random Casino Bonuses',
  description: `The Crypto Bonus Spin Wheel gives users instant access to random casino bonuses in ${new Date().getFullYear()}. Spin to discover exclusive offers from top-rated crypto casinos.`,
  keywords: 'casino bonus, spin wheel, random bonus, crypto casino, gambling offers',
};

export default async function SpinPage() {
  // Fetch all casinos with their bonuses
  const casinos = await prisma.casino.findMany({
    include: {
      bonuses: true
    },
    orderBy: {
      rating: 'desc'
    }
  }) as any; // Type assertion to handle new fields during migration

  // Fetch settings for favicon and code term
  const settings = await prisma.settings.findFirst();
  const faviconUrl = settings?.faviconUrl || '/favicon.ico';
  const codeTermLabel = await getCodeTermLabel();

  // Transform casino data for the spin wheel
  const spinData = casinos.map((casino: any) => ({
    id: casino.id,
    name: casino.name,
    slug: casino.slug,
    logo: casino.logo || '/logo-placeholder.png',
    affiliateLink: casino.affiliateLink || '',
    rating: casino.rating,
    codeTermLabel: casino.codeTermLabel || 'bonus code',
    bonus: casino.bonuses[0] ? {
      id: casino.bonuses[0].id,
      title: casino.bonuses[0].title,
      code: casino.bonuses[0].code,
      type: casino.bonuses[0].types?.length > 0 ? casino.bonuses[0].types[0] : 'other',
      value: casino.bonuses[0].value,
      description: casino.bonuses[0].description
    } : null
  }));

  return (
    <main className="min-h-screen bg-[#343541] flex flex-col">
      <div className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              Crypto Bonus Spin Wheel
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
              Spin the wheel to discover amazing casino bonuses! The casino will automatically open when you land on it.
            </p>
          </div>

          {/* Spin Wheel Component */}
          <div className="py-8">
            <SpinWheel casinos={spinData} faviconUrl={faviconUrl} />
          </div>

          {/* Instructions */}
          <div className="bg-[#3e4050] rounded-xl p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-white mb-3">How to Play</h3>
            <ul className="text-white/80 space-y-2 text-left">
              <li className="flex items-center gap-2">
                <span className="text-[#8b8c98]">•</span>
                Click the "SPIN THE WHEEL!" button to start spinning
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#8b8c98]">•</span>
                Listen to the ticking sound as it spins through all {casinos.length} casinos
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#8b8c98]">•</span>
                See which casino you land on with bonus details in the popup
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#8b8c98]">•</span>
                Click "Visit Casino" to go to the casino or "Spin Again" for another try
              </li>
            </ul>
          </div>

          {/* Back Link */}
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-[#a4a5b0] hover:text-[#68D08B] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to all bonuses
          </Link>
        </div>
      </div>
    </main>
  );
} 