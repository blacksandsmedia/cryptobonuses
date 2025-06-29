import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "react-hot-toast";
import { prisma } from '@/lib/prisma';
import ConditionalLayout from '@/components/ConditionalLayout';
import OfferNotifications from '@/components/OfferNotifications';
import SchemaMarkup from '@/components/SchemaMarkup';
import { NotificationProvider } from '@/components/NotificationContext';
import VisitorTracker from '@/components/VisitorTracker';
import Script from 'next/script';
// Initialize application startup (upload directory, etc.)
import '@/lib/startup';

const inter = Inter({ subsets: ['latin'] });
const currentYear = new Date().getFullYear();

export async function generateMetadata(): Promise<Metadata> {
  // Fetch favicon from settings
  let faviconUrl = '/favicon.ico'; // Default
  try {
    const settings = await prisma.settings.findFirst();
    if (settings?.faviconUrl) {
      faviconUrl = settings.faviconUrl;
    }
  } catch (error) {
    console.error('Error fetching favicon from settings:', error);
  }

  return {
    title: `Best Bitcoin Casino Bonuses & Crypto Promotions ${currentYear}`,
    description: `Find the best crypto casino bonuses, exclusive promo codes, and Bitcoin casino offers. Get deposit matches, free spins, and no deposit bonuses at trusted crypto casinos.`,
    keywords: 'bitcoin casino bonus, crypto casino bonus, casino promo codes, bitcoin gambling bonus, crypto gambling offers',
    metadataBase: new URL('https://cryptobonuses.com'),
    openGraph: {
      title: `Best Bitcoin Casino Bonuses & Crypto Promotions ${currentYear}`,
      description: `Find the best crypto casino bonuses, exclusive promo codes, and Bitcoin casino offers. Get deposit matches, free spins, and no deposit bonuses at trusted crypto casinos.`,
      url: 'https://cryptobonuses.com',
      type: 'website',
      images: ['https://cdn.prod.website-files.com/67dd29ae7952086f714105e7/67e11433aaedad5402a3d9c5_CryptoBonuses%20Logo%20Main.webp'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Best Bitcoin Casino Bonuses & Crypto Promotions ${currentYear}`,
      description: `Find the best crypto casino bonuses, exclusive promo codes, and Bitcoin casino offers. Get deposit matches, free spins, and no deposit bonuses at trusted crypto casinos.`,
      images: ['https://cdn.prod.website-files.com/67dd29ae7952086f714105e7/67e11433aaedad5402a3d9c5_CryptoBonuses%20Logo%20Main.webp'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    alternates: {
      canonical: 'https://cryptobonuses.com',
    },
    icons: {
      icon: [
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon.ico', sizes: 'any', type: 'image/x-icon' }
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
      ],
      shortcut: '/favicon.ico',
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch settings for favicon
  let faviconUrl = '/favicon.ico'; // Default
  
  try {
    const settings = await prisma.settings.findFirst();
    if (settings?.faviconUrl) {
      faviconUrl = settings.faviconUrl;
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
  }

  // Add cache busting parameter for favicon
  const cacheBuster = Date.now();
  const faviconWithCacheBuster = `${faviconUrl}?v=${cacheBuster}`;

  return (
    <html lang="en">
      <head>
        {/* Multiple favicon formats for better browser support */}
        <link rel="icon" type="image/x-icon" href={`/favicon.ico?v=${cacheBuster}`} />
        <link rel="icon" type="image/png" sizes="32x32" href={`/favicon-32x32.png?v=${cacheBuster}`} />
        <link rel="icon" type="image/png" sizes="16x16" href={`/favicon-16x16.png?v=${cacheBuster}`} />
        <link rel="apple-touch-icon" sizes="180x180" href={`/apple-touch-icon.png?v=${cacheBuster}`} />
        <link rel="shortcut icon" href={`/favicon.ico?v=${cacheBuster}`} />
        
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#343541" />
        
        {/* Google Analytics - Hardcoded GA4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-4RD7RLHE26"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-4RD7RLHE26');
            console.log('Google Analytics initialized with hardcoded ID: G-4RD7RLHE26');
          `}
        </Script>
      </head>
      <body className={`${inter.className} bg-[#343541] text-white overflow-x-hidden`}>
        {/* Global Schema Markup for Crypto Bonuses Organization */}
        <SchemaMarkup type="organization" />
        
        <NotificationProvider>
          <AuthProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
            <OfferNotifications />
            <VisitorTracker />
          </AuthProvider>
        </NotificationProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
} 