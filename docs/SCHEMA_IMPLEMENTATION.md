# Schema Markup Implementation

This document outlines the comprehensive schema markup implementation for the Crypto Bonuses website, designed to improve SEO performance and enable rich snippets in search results.

## Overview

The schema markup system provides structured data to search engines about:
- **Organization**: Crypto Bonuses brand information
- **Website**: Search capabilities and site information
- **Casino Products**: Detailed casino and bonus information
- **Reviews & Ratings**: Aggregate ratings and individual reviews
- **Breadcrumbs**: Navigation structure

## Implementation Structure

### Core Components

#### 1. `SchemaMarkup` Component (`src/components/SchemaMarkup.tsx`)
Central component that generates all schema types:
- **Organization Schema**: Brand information for Crypto Bonuses
- **Website Schema**: Homepage with search action
- **Casino Schema**: Product schema with reviews and ratings
- **Breadcrumb Schema**: Navigation structure

#### 2. Schema Types

##### Organization Schema
```json
{
  "@type": "Organization",
  "name": "Crypto Bonuses",
  "url": "https://cryptobonuses.com",
  "logo": "...",
  "description": "Leading platform for Bitcoin casino bonuses...",
  "sameAs": ["https://twitter.com/...", "https://facebook.com/..."],
  "foundingDate": "2024",
  "areaServed": "Worldwide"
}
```

##### Website Schema
```json
{
  "@type": "WebSite",
  "name": "Crypto Bonuses",
  "url": "https://cryptobonuses.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://cryptobonuses.com/?searchTerm={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

##### Casino Product Schema
```json
{
  "@type": "Product",
  "name": "Casino Name Bonus",
  "description": "Bonus description",
  "brand": {
    "@type": "Brand",
    "name": "Casino Name"
  },
  "offers": {
    "@type": "Offer",
    "name": "Bonus Title",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "25"
  },
  "review": [...]
}
```

### Page-Specific Implementation

#### Homepage (`src/app/page.tsx`)
- **Organization Schema**: Global brand information
- **Website Schema**: With search action functionality

#### Casino Pages (`src/app/[slug]/page.tsx`)
- **Casino Product Schema**: Detailed casino and bonus information
- **Review Schema**: Individual verified reviews
- **Aggregate Rating Schema**: Combined rating from all verified reviews
- **Breadcrumb Schema**: Navigation path

#### Layout (`src/app/layout.tsx`)
- **Global Organization Schema**: Appears on all pages

## Key Features

### 1. Enhanced Review System
- **Aggregate Ratings**: Calculated from verified reviews only
- **Individual Reviews**: Up to 5 most recent verified reviews
- **Review Validation**: Only verified reviews contribute to ratings
- **Publisher Attribution**: All reviews attributed to Crypto Bonuses

### 2. Dynamic Content
- **Real-time Ratings**: Calculated from current verified reviews
- **Casino Information**: Founded year, website, bonus details
- **Offer Validity**: Automatic expiration dates for offers

### 3. SEO Optimization
- **Rich Snippets**: Enable star ratings in search results
- **Search Enhancement**: Website search action for better discovery
- **Image Optimization**: Proper image URLs for social sharing
- **Breadcrumb Navigation**: Clear site structure for search engines

## Usage Examples

### Adding Schema to a New Page
```tsx
import SchemaMarkup from '@/components/SchemaMarkup';

// In your component
<SchemaMarkup 
  type="website" 
  data={{
    pageTitle: "Page Title",
    pageDescription: "Page Description"
  }}
/>
```

### Casino Page Implementation
```tsx
<SchemaMarkup 
  type="casino" 
  data={{
    casino: casinoData,
    bonus: bonusData,
    reviews: reviewsData
  }}
/>
```

## Validation & Testing

### Development Validation
Use the `SchemaValidator` component during development:
```tsx
import SchemaValidator from '@/components/SchemaValidator';

// Add to your page (development only)
<SchemaValidator enabled={process.env.NODE_ENV === 'development'} />
```

### Google Testing Tools
1. **Rich Results Test**: https://search.google.com/test/rich-results
2. **Structured Data Testing Tool**: https://developers.google.com/structured-data/testing-tool/
3. **Google Search Console**: Monitor schema performance

### Validation Checklist
- [ ] All required properties present
- [ ] Valid JSON-LD syntax
- [ ] Correct schema.org types
- [ ] Proper URL formatting
- [ ] Image URLs accessible
- [ ] Review data includes verified status

## Benefits

### SEO Improvements
- **Rich Snippets**: Star ratings and review counts in search results
- **Enhanced Listings**: Additional information in search previews
- **Better Understanding**: Search engines understand content context
- **Featured Snippets**: Potential for enhanced search features

### User Experience
- **Trust Signals**: Visible ratings and review counts
- **Quick Information**: Key details in search results
- **Brand Recognition**: Consistent organization information

## Best Practices

### Content Quality
- Use verified reviews only for aggregate ratings
- Ensure all URLs are absolute and accessible
- Keep descriptions concise but informative
- Update schema when content changes

### Technical Implementation
- Validate schema markup regularly
- Monitor Google Search Console for errors
- Test with Google's rich results testing tools
- Keep schema up-to-date with schema.org specifications

### Maintenance
- Regular validation of schema markup
- Update organization information as needed
- Monitor search result appearance
- Track rich snippet performance

## Future Enhancements

### Planned Additions
- **FAQ Schema**: For frequently asked questions
- **Video Schema**: If video content is added
- **Event Schema**: For casino promotions and events
- **LocalBusiness Schema**: If physical locations are added

### Monitoring
- Set up Google Search Console alerts
- Track rich snippet appearance rates
- Monitor click-through rates from enhanced results
- Regular schema validation checks

## Troubleshooting

### Common Issues
1. **Missing Required Properties**: Ensure all required schema properties are included
2. **Invalid JSON**: Validate JSON-LD syntax
3. **Incorrect URLs**: Use absolute URLs for all references
4. **Review Data**: Ensure reviews have all required fields

### Testing Steps
1. Validate with Google's Rich Results Test
2. Check JSON-LD syntax
3. Verify all URLs are accessible
4. Test with different casino pages
5. Monitor Google Search Console for errors

This schema implementation provides comprehensive structured data that enhances SEO performance and enables rich search result features for the Crypto Bonuses website. 