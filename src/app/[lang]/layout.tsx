import { ReactNode } from 'react';

// Only generate for non-default locales to avoid conflicts with root routes
// These locale codes are guaranteed not to conflict with casino domain slugs
export async function generateStaticParams() {
  const localeToGenerate = process.env.NODE_ENV === 'production' 
    ? [] // Don't generate in production to avoid conflicts
    : ['pl', 'tr', 'es', 'pt', 'vi', 'ja', 'ko', 'fr']; // Generate in development for testing
  
  return localeToGenerate.map((locale) => ({
    locale,
  }));
}

interface LocaleLayoutProps {
  children: ReactNode;
  params: {
    locale: string;
  };
}

export default function LocaleLayout({ children, params }: LocaleLayoutProps) {
  return (
    <html lang={params.locale}>
      <body>
        {children}
      </body>
    </html>
  );
} 