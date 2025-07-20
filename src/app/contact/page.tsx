import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';
import DateDisplay from '@/components/DateDisplay';
import SchemaMarkup from '@/components/SchemaMarkup';
import Link from 'next/link';
import { getLegalPageModifiedTime } from '@/lib/page-modified-time';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const legalPage = await prisma.legalPage.findUnique({
      where: { slug: 'contact' }
    });

    const baseMetadata = {
      title: 'Contact Us - CryptoBonuses',
      description: 'Contact CryptoBonuses - Get in touch with our team for questions about crypto casino bonuses, partnerships, or website feedback.',
      robots: 'index, follow',
      alternates: {
        canonical: 'https://cryptobonuses.com/contact',
      },
    };

    // Get dynamic modified time based on page updates and checks
    const dynamicModifiedTime = await getLegalPageModifiedTime('contact', legalPage?.updatedAt);

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
        url: 'https://cryptobonuses.com/contact',
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
    console.error('Error fetching contact page metadata:', error);
    
    // Get dynamic modified time even on error
    const dynamicModifiedTime = await getLegalPageModifiedTime('contact', null);
    
    return {
      title: 'Contact Us - CryptoBonuses',
      description: 'Contact CryptoBonuses - Get in touch with our team for questions about crypto casino bonuses, partnerships, or website feedback.',
      robots: 'index, follow',
      alternates: {
        canonical: 'https://cryptobonuses.com/contact',
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

export default async function ContactPage() {
  try {
    // Try to get contact page content from database, but don't require it
    let legalPage: LegalPage | null = null;
    try {
      legalPage = await prisma.legalPage.findUnique({
        where: { slug: 'contact' }
      });
    } catch (error) {
      console.log('No contact page content found, using default');
    }

    return (
      <main className="min-h-screen bg-[#343541] text-white py-8">
        {/* Schema Markup for Contact Page */}
        <SchemaMarkup 
          type="website" 
          data={{
            pageTitle: legalPage?.title || 'Contact Us - CryptoBonuses',
            pageDescription: 'Contact CryptoBonuses - Get in touch with our team for questions about crypto casino bonuses, partnerships, or website feedback.',
            pageUrl: 'https://cryptobonuses.com/contact',
            datePublished: legalPage?.createdAt?.toISOString() || '2024-01-01T00:00:00Z',
            dateModified: legalPage?.updatedAt?.toISOString() || new Date().toISOString()
          }}
        />

        <div className="mx-auto w-[90%] md:w-[95%] max-w-[1400px] px-4 md:px-6">
          <div className="mb-8">
            <div className="max-w-4xl mx-auto">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-[#a7a9b4] hover:text-[#68D08B] transition-colors duration-200 mb-6"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
                Back to Home
              </Link>
              
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between sm:gap-6 mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  {legalPage?.title || 'Contact Us'}
                </h1>
                <p className="text-[#a7a9b4] text-sm mt-2 sm:mt-0 flex-shrink-0">
                  Get in touch with our team
                </p>
              </div>

            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Get In Touch Section with Contact Form */}
            <div className="bg-[#3e4050] rounded-xl p-6 border border-[#404055] mb-8">
              <h2 className="text-xl font-bold mb-4 text-white pb-2 border-b-2 border-[#404055]">Get In Touch</h2>
              <p className="text-[#a4a5b0] mb-8 leading-relaxed">
                Have questions about crypto casino bonuses, want to submit a new bonus, or need help with our platform? 
                We're here to help! Send us a message and we'll get back to you as soon as possible.
              </p>
              
              {/* Contact Form directly below */}
              <ContactForm />
            </div>

            {/* Display dynamic content if available - AFTER the contact form */}
            {legalPage?.content && (
              <div className="mb-8">
                <div 
                  className="legal-content-wrapper"
                  dangerouslySetInnerHTML={{ __html: legalPage.content }}
                />
              </div>
            )}

            {/* Date Display */}
            <DateDisplay 
              publishedAt={legalPage?.createdAt}
              modifiedAt={legalPage?.updatedAt}
              className="mb-6"
            />
          </div>
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
            .legal-content-wrapper h2 {
              font-size: 1.5rem;
              font-weight: 600;
              margin-bottom: 1.25rem;
              margin-top: 2.5rem;
              color: white;
              padding-bottom: 0.5rem;
              border-bottom: 2px solid #404055;
            }
            
            .legal-content-wrapper h2:first-child {
              margin-top: 0;
            }
            
            .legal-content-wrapper h3 {
              font-size: 1.125rem;
              font-weight: 600;
              margin-bottom: 0.75rem;
              margin-top: 1.5rem;
              color: #68D08B;
            }
            
            .legal-content-wrapper p {
              margin-bottom: 1.25rem;
              line-height: 1.6;
              color: #a4a5b0;
            }
            
            .legal-content-wrapper ul, .legal-content-wrapper ol {
              margin-bottom: 1.25rem;
              padding-left: 1.5rem;
              color: #a4a5b0;
            }
            
            .legal-content-wrapper ul {
              list-style-type: disc;
            }
            
            .legal-content-wrapper ol {
              list-style-type: decimal;
            }
            
            .legal-content-wrapper li {
              margin-bottom: 0.5rem;
              line-height: 1.6;
              padding-left: 0.25rem;
            }
            
            .legal-content-wrapper li::marker {
              color: #68D08B;
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
              text-decoration: underline;
            }
            
            .legal-content-wrapper .section {
              background: #3e4050;
              border-radius: 0.75rem;
              padding: 1.5rem;
              border: 1px solid #404055;
              margin-bottom: 1.5rem;
            }
            
            .legal-content-wrapper .section > *:first-child {
              margin-top: 0 !important;
            }
            
            .legal-content-wrapper .section h2:first-child {
              margin-top: 0 !important;
              border-bottom: none;
              padding-bottom: 0;
            }
            
            .legal-content-wrapper .section h3:first-child {
              margin-top: 0 !important;
            }

            /* Convert text lists to proper bullet points */
            .legal-content-wrapper p:has(br) {
              white-space: pre-line;
            }
            
            /* Style for manual list items that start with dashes or similar */
            .legal-content-wrapper p {
              position: relative;
            }
            
            .legal-content-wrapper p:has(+ p:first-line:matches("- ", "• ", "* ")) {
              margin-bottom: 0.5rem;
            }
          `
        }} />
      </main>
    );
  } catch (error) {
    console.error('Error loading contact page:', error);
    notFound();
  }
} 