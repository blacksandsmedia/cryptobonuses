import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DynamicLegalPage from '@/components/DynamicLegalPage';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const legalPage = await prisma.legalPage.findUnique({
      where: { slug: 'privacy' }
    });

    if (!legalPage) {
      return {
        title: 'Privacy Policy - CryptoBonuses',
        description: 'Privacy Policy for CryptoBonuses - Learn how we collect, use, and protect your personal information when you visit our crypto casino bonus website.',
        robots: 'index, follow',
        alternates: {
          canonical: 'https://cryptobonuses.com/privacy',
        },
      };
    }

    const pageData = legalPage as any; // Temporary type assertion until types update

    return {
      title: pageData.metaTitle || `${legalPage.title} - CryptoBonuses`,
      description: pageData.metaDescription || 'Privacy Policy for CryptoBonuses - Learn how we collect, use, and protect your personal information when you visit our crypto casino bonus website.',
      robots: 'index, follow',
      alternates: {
        canonical: 'https://cryptobonuses.com/privacy',
      },
      other: {
        'last-modified': pageData.lastModified?.toISOString() || new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error fetching privacy page metadata:', error);
    return {
      title: 'Privacy Policy - CryptoBonuses',
      description: 'Privacy Policy for CryptoBonuses - Learn how we collect, use, and protect your personal information when you visit our crypto casino bonus website.',
      robots: 'index, follow',
      alternates: {
        canonical: 'https://cryptobonuses.com/privacy',
      },
    };
  }
}

export default async function PrivacyPage() {
  try {
    const legalPage = await prisma.legalPage.findUnique({
      where: { slug: 'privacy' }
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
    console.error('Error fetching privacy page:', error);
    notFound();
  }
} 