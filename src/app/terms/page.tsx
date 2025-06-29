import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DynamicLegalPage from '@/components/DynamicLegalPage';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const legalPage = await prisma.legalPage.findUnique({
      where: { slug: 'terms' }
    });

    if (!legalPage) {
      return {
        title: 'Terms of Service - CryptoBonuses',
        description: 'Terms of Service for CryptoBonuses - Read our terms and conditions for using our crypto casino bonus platform and services.',
        robots: 'index, follow',
        alternates: {
          canonical: 'https://cryptobonuses.com/terms',
        },
      };
    }

    const pageData = legalPage as any; // Temporary type assertion until types update

    return {
      title: pageData.metaTitle || `${legalPage.title} - CryptoBonuses`,
      description: pageData.metaDescription || 'Terms of Service for CryptoBonuses - Read our terms and conditions for using our crypto casino bonus platform and services.',
      robots: 'index, follow',
      alternates: {
        canonical: 'https://cryptobonuses.com/terms',
      },
      other: {
        'last-modified': pageData.lastModified?.toISOString() || new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error fetching terms page metadata:', error);
    return {
      title: 'Terms of Service - CryptoBonuses',
      description: 'Terms of Service for CryptoBonuses - Read our terms and conditions for using our crypto casino bonus platform and services.',
      robots: 'index, follow',
      alternates: {
        canonical: 'https://cryptobonuses.com/terms',
      },
    };
  }
}

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