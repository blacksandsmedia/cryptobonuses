import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DynamicLegalPage from '@/components/DynamicLegalPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - CryptoBonuses',
  description: 'Terms of Service for CryptoBonuses - Read our terms and conditions for using our crypto casino bonus platform and services.',
  robots: 'index, follow'
};

export const dynamic = 'force-dynamic';

export default async function TermsPage() {
  try {
    const legalPage = await prisma.legalPage.findUnique({
      where: { slug: 'terms' }
    });

    if (!legalPage) {
      notFound();
    }

    return (
      <DynamicLegalPage 
        title={legalPage.title}
        content={legalPage.content}
        lastUpdated={legalPage.updatedAt.toISOString()}
      />
    );
  } catch (error) {
    console.error('Error fetching terms page:', error);
    notFound();
  }
} 