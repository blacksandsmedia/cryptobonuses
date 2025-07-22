import { notFound } from 'next/navigation';
import TermsPage from '../../terms/page';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return [];
}

interface LangTermsPageProps {
  params: {
    slug: string;
  };
}

export default function LangTermsPage({ params }: LangTermsPageProps) {
  const { slug: lang } = params;
  
  // Validate that the slug is a valid language code
  const supportedLanguages = ['pl', 'tr', 'es', 'pt', 'vi', 'ja', 'ko', 'fr'];
  
  if (!supportedLanguages.includes(lang)) {
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
  
  return (
    <div>
      {/* Translation indicator */}
      <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-3 mx-auto w-[90%] md:w-[95%] max-w-[1280px] mt-8 mb-6">
        <div className="text-orange-500 font-semibold text-sm">
          📄 Terms Page in {languageNames[lang]}
        </div>
        <div className="text-white text-xs mt-1">
          URL: /{lang}/terms
        </div>
      </div>
      
      {/* Render the original terms page */}
      <TermsPage />
    </div>
  );
} 