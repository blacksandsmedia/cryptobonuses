import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

// Make this route fully dynamic
export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  // Return empty array to make this fully dynamic and avoid route conflicts
  return [];
}

interface LangCasinoPageProps {
  params: {
    slug: string;
    casino: string;
  };
}

export default async function LangCasinoPage({ params }: LangCasinoPageProps) {
  const { slug: lang, casino: casinoSlug } = params;
  
  // Validate that the first slug is a valid language code
  const supportedLanguages = ['pl', 'tr', 'es', 'pt', 'vi', 'ja', 'ko', 'fr'];
  
  if (!supportedLanguages.includes(lang)) {
    notFound();
  }
  
  // Check if the casino exists
  const casinoExists = await prisma.casino.findUnique({
    where: { slug: casinoSlug },
    select: { id: true, name: true }
  });
  
  if (!casinoExists) {
    notFound();
  }
  
  // Get language display name
  const languageNames: Record<string, string> = {
    'pl': 'Polish (Polski)',
    'tr': 'Turkish (Türkçe)', 
    'es': 'Spanish (Español)',
    'pt': 'Portuguese (Português)',
    'vi': 'Vietnamese (Tiếng Việt)',
    'ja': 'Japanese (日本語)',
    'ko': 'Korean (한국어)',
    'fr': 'French (Français)'
  };
  
  // Import and render the original casino page logic
  const SlugPage = (await import('../page')).default;
  const casinoPageProps = {
    params: {
      slug: casinoSlug
    }
  };
  
  return (
    <div>
      {/* Translation indicator for casino pages */}
      <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-3 mx-auto w-[90%] md:w-[95%] max-w-[1280px] mt-8 mb-6">
        <div className="text-blue-500 font-semibold text-sm">
          🎰 Casino Page in {languageNames[lang]} - {casinoExists.name}
        </div>
        <div className="text-white text-xs mt-1">
          URL: /{lang}/{casinoSlug}
        </div>
      </div>
      
      {/* Render the original casino page */}
      <SlugPage {...casinoPageProps} />
    </div>
  );
} 