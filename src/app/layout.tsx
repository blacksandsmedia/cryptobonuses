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
import Script from 'next/script';

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
      icon: faviconUrl,
      apple: faviconUrl,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch settings including favicon and Google Analytics ID
  let faviconUrl = '/favicon.ico'; // Default
  let googleAnalyticsId = null;
  
  try {
    const settings = await prisma.settings.findFirst();
    if (settings?.faviconUrl) {
      faviconUrl = settings.faviconUrl;
    }
    if (settings?.googleAnalyticsId) {
      googleAnalyticsId = settings.googleAnalyticsId;
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
  }

  return (
    <html lang="en">
      <head>
        <link rel="icon" href={faviconUrl} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#343541" />
        
        {/* Google Analytics */}
        {googleAnalyticsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleAnalyticsId}');
              `}
            </Script>
          </>
        )}
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
          </AuthProvider>
        </NotificationProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
} 