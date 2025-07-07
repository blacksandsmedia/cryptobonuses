import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';
import DateDisplay from '@/components/DateDisplay';
import SchemaMarkup from '@/components/SchemaMarkup';
import Link from 'next/link';
import { getLegalPageModifiedTime } from '@/lib/page-modified-time';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const legalPage = await prisma.legalPage.findUnique({
      where: { slug: 'about' }
    });

    const baseMetadata = {
      title: 'About Us - CryptoBonuses',
      description: 'Learn about CryptoBonuses - Your trusted source for the best cryptocurrency casino bonuses, exclusive promo codes, and expert reviews of Bitcoin gambling sites.',
      robots: 'index, follow',
      alternates: {
        canonical: 'https://cryptobonuses.com/about',
      },
    };

    // Get dynamic modified time based on page updates and checks
    const dynamicModifiedTime = await getLegalPageModifiedTime('about', legalPage?.updatedAt);

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
        url: 'https://cryptobonuses.com/about',
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
    console.error('Error fetching about page metadata:', error);
    
    // Get dynamic modified time even on error
    const dynamicModifiedTime = await getLegalPageModifiedTime('about', null);
    
    return {
      title: 'About Us - CryptoBonuses',
      description: 'Learn about CryptoBonuses - Your trusted source for the best cryptocurrency casino bonuses, exclusive promo codes, and expert reviews of Bitcoin gambling sites.',
      robots: 'index, follow',
      alternates: {
        canonical: 'https://cryptobonuses.com/about',
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

export default async function AboutPage() {
  try {
    // Try to get about page content from database
    let legalPage: LegalPage | null = null;
    try {
      legalPage = await prisma.legalPage.findUnique({
        where: { slug: 'about' }
      });
    } catch (error) {
      console.log('No about page content found in database, using default');
    }

    // Default content if not found in database
    const defaultContent = {
      title: 'About CryptoBonuses',
      content: `
        <div class="section">
          <h2>Welcome to CryptoBonuses</h2>
          <p>CryptoBonuses is your trusted source for the best cryptocurrency casino bonuses, exclusive promotional codes, and comprehensive reviews of Bitcoin gambling platforms. We've dedicated ourselves to helping crypto enthusiasts find the most rewarding and secure online casino experiences.</p>
        </div>

        <div class="section">
          <h2>Our Mission</h2>
          <p>Our mission is simple: to connect cryptocurrency users with the best casino bonuses and promotional offers available in the digital gambling space. We believe that everyone deserves access to fair, transparent, and rewarding gaming experiences.</p>
          
          <h3>What We Do</h3>
          <ul>
            <li><strong>Curate Premium Bonuses:</strong> We carefully select and verify the best crypto casino bonuses from trusted operators</li>
            <li><strong>Provide Expert Reviews:</strong> Our team conducts thorough reviews of cryptocurrency casinos to ensure quality and safety</li>
            <li><strong>Offer Exclusive Codes:</strong> We negotiate special promotional codes and bonuses exclusively for our users</li>
            <li><strong>Maintain Transparency:</strong> All our recommendations are based on merit, security, and user value</li>
          </ul>
        </div>

        <div class="section">
          <h2>Why Choose CryptoBonuses?</h2>
          
          <h3>🔍 Thoroughly Verified</h3>
          <p>Every casino and bonus on our platform undergoes rigorous verification to ensure legitimacy and fair terms.</p>
          
          <h3>🎯 User-Focused</h3>
          <p>We prioritize user experience and value, featuring only bonuses that provide real benefits to players.</p>
          
          <h3>🔒 Security First</h3>
          <p>We only partner with licensed and regulated cryptocurrency casinos that prioritize player safety and fund security.</p>
          
          <h3>📱 Always Updated</h3>
          <p>Our team constantly monitors and updates bonus information to ensure accuracy and availability.</p>
        </div>

        <div class="section">
          <h2>Our Values</h2>
          
          <h3>Transparency</h3>
          <p>We believe in honest, transparent reporting about casino bonuses, terms, and conditions. No hidden surprises.</p>
          
          <h3>Integrity</h3>
          <p>Our reviews and recommendations are based solely on merit and user value, never influenced by affiliate relationships.</p>
          
          <h3>Innovation</h3>
          <p>We embrace the evolving cryptocurrency gambling landscape and continuously improve our platform to serve users better.</p>
          
          <h3>Community</h3>
          <p>We're building a community of informed crypto casino enthusiasts who can make better gambling decisions.</p>
        </div>

        <div class="section">
          <h2>Get Started</h2>
          <p>Ready to explore the best crypto casino bonuses? Browse our curated selection of verified bonuses and start your cryptocurrency gambling journey with confidence. Whether you're looking for welcome bonuses, free spins, or no-deposit offers, we've got you covered.</p>
          
          <p>Have questions or suggestions? <a href="/contact">Contact our team</a> – we're always happy to help!</p>
        </div>
      `,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    };

    const pageData = legalPage || defaultContent;

    return (
      <main className="min-h-screen bg-[#343541] text-white py-8">
        {/* Schema Markup for About Page */}
        <SchemaMarkup 
          type="website" 
          data={{
            pageTitle: pageData.title,
            pageDescription: 'Learn about CryptoBonuses - Your trusted source for the best cryptocurrency casino bonuses, exclusive promo codes, and expert reviews of Bitcoin gambling sites.',
            pageUrl: 'https://cryptobonuses.com/about',
            datePublished: pageData.createdAt?.toISOString() || '2024-01-01T00:00:00Z',
            dateModified: pageData.updatedAt?.toISOString() || new Date().toISOString()
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
                  {pageData.title}
                </h1>
                <p className="text-[#a7a9b4] text-sm mt-2 sm:mt-0 flex-shrink-0">
                  Learn about our mission
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Main About Content */}
            <div className="mb-8">
              <div 
                className="legal-content-wrapper"
                dangerouslySetInnerHTML={{ __html: pageData.content }}
              />
            </div>

            {/* Date Display */}
            <DateDisplay 
              publishedAt={pageData.createdAt}
              modifiedAt={pageData.updatedAt}
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
          `
        }} />
      </main>
    );
  } catch (error) {
    console.error('Error loading about page:', error);
    notFound();
  }
} 