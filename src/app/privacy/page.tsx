import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DynamicLegalPage from '@/components/DynamicLegalPage';
import DateDisplay from '@/components/DateDisplay';
import SchemaMarkup from '@/components/SchemaMarkup';
import { Metadata } from 'next';
import Link from 'next/link';
import { getLegalPageModifiedTime } from '@/lib/page-modified-time';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const legalPage = await prisma.legalPage.findUnique({
      where: { slug: 'privacy' }
    });

    const baseMetadata = {
      title: 'Privacy Policy - CryptoBonuses',
      description: 'Privacy Policy for CryptoBonuses - Learn how we collect, use, and protect your personal information when you visit our crypto casino bonus website.',
      robots: 'index, follow',
      alternates: {
        canonical: 'https://cryptobonuses.com/privacy',
      },
    };

    // Get dynamic modified time based on page updates and checks
    const dynamicModifiedTime = await getLegalPageModifiedTime('privacy', legalPage?.updatedAt);

    if (!legalPage) {
      return {
        ...baseMetadata,
        other: {
          'article:published_time': '2024-01-01T00:00:00Z',
          'article:modified_time': dynamicModifiedTime,
        },
      };
    }

    return {
      ...baseMetadata,
      title: `${legalPage.title} - CryptoBonuses`,
      openGraph: {
        title: `${legalPage.title} - CryptoBonuses`,
        description: baseMetadata.description,
        url: 'https://cryptobonuses.com/privacy',
        type: 'article',
        publishedTime: legalPage.createdAt?.toISOString(),
        modifiedTime: dynamicModifiedTime,
      },
      other: {
        'article:published_time': legalPage.createdAt?.toISOString() || '2024-01-01T00:00:00Z',
        'article:modified_time': dynamicModifiedTime,
      },
    };
  } catch (error) {
    console.error('Error fetching privacy page metadata:', error);
    
    // Get dynamic modified time even on error
    const dynamicModifiedTime = await getLegalPageModifiedTime('privacy', null);
    
    return {
      title: 'Privacy Policy - CryptoBonuses',
      description: 'Privacy Policy for CryptoBonuses - Learn how we collect, use, and protect your personal information when you visit our crypto casino bonus website.',
      robots: 'index, follow',
      alternates: {
        canonical: 'https://cryptobonuses.com/privacy',
      },
      other: {
        'article:published_time': '2024-01-01T00:00:00Z',
        'article:modified_time': dynamicModifiedTime,
      },
    };
  }
}

interface LegalPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export default async function PrivacyPage() {
  let legalPage: LegalPage | null = null;
  
  try {
    legalPage = await prisma.legalPage.findUnique({
      where: { slug: 'privacy' }
    });
  } catch (error) {
    console.error('Error fetching privacy page:', error);
  }

  if (!legalPage) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#343541] text-white py-8">
      {/* Schema Markup for Privacy Page */}
      <SchemaMarkup 
        type="website" 
        data={{
          pageTitle: legalPage.title,
          pageDescription: 'Privacy Policy for CryptoBonuses - Learn how we collect, use, and protect your personal information when you visit our crypto casino bonus website.',
          pageUrl: 'https://cryptobonuses.com/privacy',
          datePublished: legalPage.createdAt?.toISOString(),
          dateModified: legalPage.updatedAt?.toISOString()
        }}
      />

      <div className="mx-auto w-[90%] md:w-[95%] max-w-[800px]">
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-[#68D08B] hover:text-[#5bc47d] transition-colors duration-200 mb-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Back to Home
          </Link>
          
          <h1 className="text-4xl font-bold mb-4">{legalPage.title}</h1>
        </div>

        <div 
          className="legal-content-wrapper"
          dangerouslySetInnerHTML={{ __html: legalPage.content }}
        />

        {/* Date Display */}
        <DateDisplay 
          publishedAt={legalPage.createdAt}
          modifiedAt={legalPage.updatedAt}
          className="mb-6"
        />
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          .legal-content-wrapper h2 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1rem;
            margin-top: 2rem;
            color: white;
          }
          
          .legal-content-wrapper h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
            margin-top: 1.5rem;
            color: #68D08B;
          }
          
          .legal-content-wrapper p {
            margin-bottom: 1rem;
            line-height: 1.6;
            color: #a4a5b0;
          }
          
          .legal-content-wrapper ul, .legal-content-wrapper ol {
            margin-bottom: 1rem;
            padding-left: 1.5rem;
          }
          
          .legal-content-wrapper li {
            margin-bottom: 0.5rem;
            color: #a4a5b0;
          }
          
          .legal-content-wrapper strong {
            color: white;
            font-weight: 600;
          }
          
          .legal-content-wrapper a {
            color: #68D08B;
            text-decoration: none;
            transition: color 0.2s;
          }
          
          .legal-content-wrapper a:hover {
            color: #5bc47d;
          }
          
          .legal-content-wrapper .section {
            background: #2c2f3a;
            border-radius: 0.75rem;
            padding: 1.5rem;
            border: 1px solid #404055;
            margin-bottom: 2rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          }
        `
      }} />
    </main>
  );
} 