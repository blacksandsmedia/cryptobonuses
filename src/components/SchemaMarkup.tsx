import Script from 'next/script';
import { normalizeImagePath } from '@/lib/image-utils';

interface Review {
  id: string;
  author: string;
  content: string;
  rating: number;
  createdAt?: string;
  verified?: boolean;
}

interface Casino {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description: string;
  rating: number;
  website?: string;
  featuredImage?: string;
  foundedYear?: number;
}

interface Bonus {
  id: string;
  title: string;
  description: string;
  code?: string;
  value: string;
  types?: string[];
}

interface SchemaMarkupProps {
  type: 'organization' | 'website' | 'casino' | 'breadcrumbs' | 'brand';
  data?: {
    casino?: Casino;
    bonus?: Bonus;
    reviews?: Review[];
    breadcrumbs?: { name: string; url: string }[];
    pageTitle?: string;
    pageDescription?: string;
    pageUrl?: string;
    datePublished?: string;
    dateModified?: string;
  };
}

// Organization Schema for Crypto Bonuses brand
const getOrganizationSchema = () => {
  const currentYear = new Date().getFullYear();
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://cryptobonuses.com/#organization',
    'name': 'Crypto Bonuses',
    'alternateName': 'CryptoBonuses',
    'url': 'https://cryptobonuses.com',
    'logo': {
      '@type': 'ImageObject',
      'url': 'https://cdn.prod.website-files.com/67dd29ae7952086f714105e7/67e11433aaedad5402a3d9c5_CryptoBonuses%20Logo%20Main.webp',
      'width': 512,
      'height': 512
    },
    'description': `Crypto Bonuses is the leading platform for Bitcoin casino bonuses and cryptocurrency gambling promotions in ${currentYear}. We provide expert reviews, exclusive bonus codes, and verified offers from trusted crypto casinos.`,
    'foundingDate': '2024-01-01',
    'areaServed': 'Worldwide',
    'knowsAbout': [
      'Bitcoin Casino Bonuses',
      'Cryptocurrency Gambling',
      'Crypto Casino Reviews',
      'Blockchain Gaming',
      'Bitcoin Promotions'
    ],
    'sameAs': [
      'https://x.com/CryptoBonusesco'
    ],
    'contactPoint': {
      '@type': 'ContactPoint',
      'contactType': 'customer service',
      'availableLanguage': ['English']
    }
  };
};

// Website Schema with search action
const getWebsiteSchema = (pageTitle?: string, pageDescription?: string, datePublished?: string, dateModified?: string) => {
  const currentYear = new Date().getFullYear();
  
  // Ensure dates are in proper ISO format
  const formatDate = (dateString?: string): string => {
    if (!dateString) return new Date().toISOString();
    try {
      return new Date(dateString).toISOString();
    } catch {
      return new Date().toISOString();
    }
  };
  
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://cryptobonuses.com/#website',
    'name': pageTitle || `Crypto Bonuses - Best Bitcoin Casino Bonuses ${currentYear}`,
    'alternateName': 'CryptoBonuses',
    'description': pageDescription || `Discover the best Bitcoin casino bonuses and promotional offers in ${currentYear}. Our expertly curated list includes trusted crypto casinos offering generous welcome packages, exclusive bonus codes, and free spins.`,
    'url': 'https://cryptobonuses.com',
    'publisher': {
      '@id': 'https://cryptobonuses.com/#organization'
    },
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': 'https://cryptobonuses.com/?searchTerm={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    },
    'inLanguage': 'en-US'
  };

  // Add dates if provided
  if (datePublished) {
    schema.datePublished = formatDate(datePublished);
  }
  if (dateModified) {
    schema.dateModified = formatDate(dateModified);
  }

  return schema;
};

// Enhanced Casino Schema with reviews and aggregate rating
const getCasinoSchema = (casino: Casino, bonus?: Bonus, reviews?: Review[], datePublished?: string, dateModified?: string) => {
  // Helper function to create absolute URLs for schema markup
  const createAbsoluteImageUrl = (imagePath: string | null | undefined): string => {
    if (!imagePath) return 'https://cryptobonuses.com/logo.png';
    
    // If already absolute URL, return as-is
    if (imagePath.startsWith('http')) return imagePath;
    
    // Normalize the path first using the established utility
    const normalizedPath = normalizeImagePath(imagePath);
    
    // Create absolute URL - handle both relative and absolute paths
    const baseUrl = 'https://cryptobonuses.com';
    if (normalizedPath.startsWith('/')) {
      return `${baseUrl}${normalizedPath}`;
    }
    return `${baseUrl}/${normalizedPath}`;
  };

  // Calculate aggregate rating from verified reviews
  const verifiedReviews = reviews?.filter(review => review.verified) || [];
  const aggregateRating = verifiedReviews.length > 0 
    ? verifiedReviews.reduce((sum, review) => sum + review.rating, 0) / verifiedReviews.length
    : casino.rating;

  // Ensure dates are in proper ISO format
  const formatDate = (dateString?: string): string => {
    if (!dateString) return new Date().toISOString();
    try {
      return new Date(dateString).toISOString();
    } catch {
      return new Date().toISOString();
    }
  };

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `https://cryptobonuses.com/${casino.slug}#article`,
    'headline': bonus?.code 
      ? `${casino.name} Promo Code ${bonus.code} - ${bonus.title}`
      : `${casino.name} Casino Bonus Review`,
    'description': bonus?.description || casino.description,
    'image': {
      '@type': 'ImageObject',
      'url': casino.featuredImage 
        ? createAbsoluteImageUrl(casino.featuredImage)
        : createAbsoluteImageUrl(casino.logo),
      'width': 1200,
      'height': 630
    },
    'url': `https://cryptobonuses.com/${casino.slug}`,
    'author': {
      '@type': 'Organization',
      '@id': 'https://cryptobonuses.com/#organization',
      'name': 'Crypto Bonuses',
      'url': 'https://cryptobonuses.com'
    },
    'publisher': {
      '@type': 'Organization',
      '@id': 'https://cryptobonuses.com/#organization',
      'name': 'Crypto Bonuses',
      'url': 'https://cryptobonuses.com',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://cdn.prod.website-files.com/67dd29ae7952086f714105e7/67e11433aaedad5402a3d9c5_CryptoBonuses%20Logo%20Main.webp',
        'width': 512,
        'height': 512
      }
    },
    'datePublished': formatDate(datePublished),
    'dateModified': formatDate(dateModified),
    'inLanguage': 'en-US',
    'about': {
      '@type': 'Organization',
      'name': casino.name,
      'url': casino.website,
      'logo': {
        '@type': 'ImageObject',
        'url': createAbsoluteImageUrl(casino.logo)
      },
      'foundingDate': casino.foundedYear ? `${casino.foundedYear}-01-01` : undefined
    },
    'mainEntity': {
      '@type': 'Service',
      'name': bonus?.title || `${casino.name} Casino Bonus`,
      'description': bonus?.description || casino.description,
      'provider': {
        '@type': 'Organization',
        'name': casino.name,
        'url': casino.website
      },
      'category': 'Bitcoin Casino Bonus',
      'audience': {
        '@type': 'Audience',
        'name': 'Cryptocurrency Users'
      }
    },
    'isPartOf': {
      '@type': 'WebSite',
      '@id': 'https://cryptobonuses.com/#website'
    }
  };

  // Remove undefined values
  if (!casino.foundedYear) {
    delete schema.about.foundingDate;
  }

  // Add offers section for the service
  if (bonus) {
    schema.mainEntity.offers = {
      '@type': 'Offer',
      'name': bonus.title,
      'description': bonus.description,
      'priceCurrency': 'USD',
      'price': '0',
      'availability': 'https://schema.org/InStock',
      'seller': {
        '@type': 'Organization',
        'name': casino.name,
        'url': casino.website
      },
      'validThrough': new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
      'category': bonus.types?.join(', ') || 'Casino Bonus'
    };
  }

  // Add aggregate rating if there are reviews
  if (verifiedReviews.length > 0) {
    schema.mainEntity.aggregateRating = {
      '@type': 'AggregateRating',
      'ratingValue': parseFloat(aggregateRating.toFixed(1)),
      'reviewCount': verifiedReviews.length,
      'bestRating': 5,
      'worstRating': 1
    };

    // Add individual reviews to the article
    schema.review = verifiedReviews.slice(0, 5).map((review, index) => ({
      '@type': 'Review',
      'reviewRating': {
        '@type': 'Rating',
        'ratingValue': review.rating,
        'bestRating': 5,
        'worstRating': 1
      },
      'author': {
        '@type': 'Person',
        'name': review.author
      },
      'reviewBody': review.content,
      'datePublished': review.createdAt 
        ? formatDate(review.createdAt)
        : formatDate(),
      'itemReviewed': {
        '@type': 'Service',
        'name': `${casino.name} Casino Bonus`
      }
    }));
  }

  return schema;
};

// Breadcrumb Schema
const getBreadcrumbSchema = (breadcrumbs: { name: string; url: string }[]) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': crumb.name,
      'item': crumb.url
    }))
  };
};

// Brand Schema for Crypto Bonuses (to establish brand connection on casino pages)
const getBrandSchema = () => {
  const currentYear = new Date().getFullYear();
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    '@id': 'https://cryptobonuses.com/#brand',
    'name': 'Crypto Bonuses',
    'alternateName': 'CryptoBonuses',
    'url': 'https://cryptobonuses.com/',
    'logo': {
      '@type': 'ImageObject',
      'url': 'https://cdn.prod.website-files.com/67dd29ae7952086f714105e7/67e11433aaedad5402a3d9c5_CryptoBonuses%20Logo%20Main.webp',
      'width': 512,
      'height': 512
    },
    'description': `Crypto Bonuses is the trusted source for Bitcoin casino bonuses and cryptocurrency gambling promotions in ${currentYear}.`
  };
};

export default function SchemaMarkup({ type, data = {} }: SchemaMarkupProps) {
  let schema;
  let schemaId = '';

  switch (type) {
    case 'organization':
      schema = getOrganizationSchema();
      schemaId = 'organization-schema';
      break;
    case 'website':
      schema = getWebsiteSchema(data.pageTitle, data.pageDescription, data.datePublished, data.dateModified);
      schemaId = 'website-schema';
      break;
    case 'casino':
      if (!data.casino) return null;
      schema = getCasinoSchema(data.casino, data.bonus, data.reviews, data.datePublished, data.dateModified);
      schemaId = 'casino-schema';
      break;
    case 'breadcrumbs':
      if (!data.breadcrumbs) return null;
      schema = getBreadcrumbSchema(data.breadcrumbs);
      schemaId = 'breadcrumb-schema';
      break;
    case 'brand':
      schema = getBrandSchema();
      schemaId = 'brand-schema';
      break;
    default:
      return null;
  }

  return (
    <Script 
      id={schemaId} 
      type="application/ld+json" 
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} 
    />
  );
}

// Export individual schema functions for use in components
export {
  getOrganizationSchema,
  getWebsiteSchema,
  getCasinoSchema,
  getBreadcrumbSchema,
  getBrandSchema
}; 