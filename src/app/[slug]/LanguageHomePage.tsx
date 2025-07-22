import { Metadata } from 'next';
import HomePage from '../page';

// Translation messages
const messages = {
  tr: {
    title: "En İyi Bitcoin Casino Bonusları ve Kripto Promosyonları 2025",
    description: "En iyi kripto casino bonuslarını, özel promosyon kodlarını ve Bitcoin casino tekliflerini bulun. Güvenilir kripto casinolardan para yatırma eşleşmeleri, bedava dönüşler ve para yatırma bonusları alın."
  },
  pl: {
    title: "Najlepsze Bonusy Bitcoin Casino i Promocje Krypto 2025", 
    description: "Znajdź najlepsze bonusy krypto casino, ekskluzywne kody promocyjne i oferty Bitcoin casino. Otrzymaj dopasowania depozytów, darmowe obroty i bonusy bez depozytu w zaufanych krypto kasynach."
  }
};

interface LanguageHomePageProps {
  language: string;
}

export async function LanguageHomePage({ language }: LanguageHomePageProps) {
  // Get translations for this language, fallback to English
  const translations = messages[language as keyof typeof messages];
  
  if (translations) {
    // For now, we'll add a simple indicator that shows the page is translated
    // and render the original homepage below it
    return (
      <div>
        {/* Translation indicator */}
        <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 mx-auto w-[90%] md:w-[95%] max-w-[1280px] mt-8 mb-6">
          <div className="text-green-500 font-semibold text-sm">
            ✅ Page Translated: {language.toUpperCase()}
          </div>
          <div className="text-white text-sm mt-1">
            <strong>Title:</strong> {translations.title}
          </div>
          <div className="text-[#a4a5b0] text-xs mt-1">
            <strong>Description:</strong> {translations.description.substring(0, 150)}...
          </div>
        </div>
        
        {/* Render the original homepage */}
        <HomePage />
      </div>
    );
  }
  
  // Fallback to original homepage for unsupported languages
  return <HomePage />;
} 