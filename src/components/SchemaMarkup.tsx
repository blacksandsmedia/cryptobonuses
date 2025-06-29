import Script from 'next/script';
import { normalizeImagePath } from '@/lib/utils';

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
    'foundingDate': '2024',
    'slogan': 'Your trusted source for crypto casino bonuses',
    'areaServed': 'Worldwide',
    'knowsAbout': [
      'Bitcoin Casino Bonuses',
      'Cryptocurrency Gambling',
      'Crypto Casino Reviews',
      'Blockchain Gaming',
      'Bitcoin Promotions'
    ],
    'sameAs': [
      'https://twitter.com/cryptobonusescom'
    ],
    'contactPoint': {
      '@type': 'ContactPoint',
      'contactType': 'customer service',
      'availableLanguage': ['English']
    }
  };
};

// Website Schema with search action
const getWebsiteSchema = (pageTitle?: string, pageDescription?: string) => {
  const currentYear = new Date().getFullYear();
  
  return {
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
};

// Enhanced Casino Schema with reviews and aggregate rating
const getCasinoSchema = (casino: Casino, bonus?: Bonus, reviews?: Review[]) => {
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

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `https://cryptobonuses.com/${casino.slug}#product`,
    'name': bonus?.code 
      ? `${casino.name} Promo Code - ${bonus.code}`
      : `${casino.name} Casino Bonus`,
    'description': bonus?.description || casino.description,
    'image': casino.featuredImage 
      ? createAbsoluteImageUrl(casino.featuredImage)
      : createAbsoluteImageUrl(casino.logo),
    'url': `https://cryptobonuses.com/${casino.slug}`,
    'brand': {
      '@type': 'Brand',
      'name': casino.name,
      'logo': createAbsoluteImageUrl(casino.logo),
      'url': casino.website
    },
    'category': 'Bitcoin Casino Bonus',
    'audience': {
      '@type': 'Audience',
      'audienceType': 'cryptocurrency users'
    },
    // Add publisher information for Crypto Bonuses brand
    'publisher': {
      '@type': 'Organization',
      '@id': 'https://cryptobonuses.com/#organization',
      'name': 'Crypto Bonuses',
      'url': 'https://cryptobonuses.com',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://cdn.prod.website-files.com/67dd29ae7952086f714105e7/67e11433aaedad5402a3d9c5_CryptoBonuses%20Logo%20Main.webp'
      }
    },
    // Add isPartOf to link to the main website
    'isPartOf': {
      '@type': 'WebSite',
      '@id': 'https://cryptobonuses.com/#website',
      'name': 'Crypto Bonuses',
      'url': 'https://cryptobonuses.com'
    }
  };

  // Add founding date if available
  if (casino.foundedYear) {
    schema.brand.foundingDate = casino.foundedYear.toString();
  }

  // Add offers section
  if (bonus) {
    schema.offers = {
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
      'priceValidUntil': new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      'category': bonus.types?.join(', ') || 'Casino Bonus'
    };
  }

  // Add aggregate rating if there are reviews
  if (verifiedReviews.length > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      '@id': `https://cryptobonuses.com/${casino.slug}#aggregaterating`,
      'ratingValue': aggregateRating.toFixed(1),
      'reviewCount': verifiedReviews.length.toString(),
      'bestRating': '5',
      'worstRating': '1'
    };

    // Add individual reviews
    schema.review = verifiedReviews.slice(0, 5).map((review, index) => ({
      '@type': 'Review',
      '@id': `https://cryptobonuses.com/${casino.slug}#review${index + 1}`,
      'reviewRating': {
        '@type': 'Rating',
        'ratingValue': review.rating.toString(),
        'bestRating': '5',
        'worstRating': '1'
      },
      'author': {
        '@type': 'Person',
        'name': review.author
      },
      'reviewBody': review.content,
      'datePublished': review.createdAt 
        ? new Date(review.createdAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      'publisher': {
        '@id': 'https://cryptobonuses.com/#organization'
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
    'description': `Crypto Bonuses is the trusted source for Bitcoin casino bonuses and cryptocurrency gambling promotions in ${currentYear}.`,
    'slogan': 'Your trusted source for crypto casino bonuses'
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
      schema = getWebsiteSchema(data.pageTitle, data.pageDescription);
      schemaId = 'website-schema';
      break;
    case 'casino':
      if (!data.casino) return null;
      schema = getCasinoSchema(data.casino, data.bonus, data.reviews);
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