import { Metadata } from "next";

// Generate metadata for the report page
export async function generateMetadata({
  params,
}: {
  params: { casinoId: string };
}): Promise<Metadata> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/casinos/${params.casinoId}`, {
      cache: 'no-store' // Always fetch fresh data for metadata
    });
    
    if (response.ok) {
      const data = await response.json();
      const casinoName = data.casino?.name || 'Casino';
      
      return {
        title: `${casinoName} Reports - View & Submit Reports`,
        description: `Report ${casinoName} for misleading users, scams and more. Read other reports from community members.`,
        robots: 'noindex, nofollow', // Prevent indexing of report pages
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }
  
  // Fallback metadata
  return {
    title: 'Casino Reports - View & Submit Reports',
    description: 'Report casino for misleading users, scams and more. Read other reports from community members.',
    robots: 'noindex, nofollow',
  };
}

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 