# Dynamic Modified Time System

## Overview

The Dynamic Modified Time System automatically updates the `article:modified_time` meta tag for all pages based on both content changes and page checks. This ensures that search engines and social media platforms always see the most up-to-date modification timestamp for each page.

## How It Works

The system determines the most recent modification time for each page by comparing:

1. **Content Updates**: Database record `updatedAt` timestamps
2. **Page Checks**: Manual or automatic page check timestamps
3. **Related Content**: For the homepage, also considers recent casino updates

The most recent timestamp among these sources is used as the page's modified time.

## Implementation Details

### Core Functions

Located in `src/lib/page-modified-time.ts`:

- `getPageModifiedTime(options)` - Core function that determines modification time
- `getHomepageModifiedTime()` - Specialized function for homepage
- `getCasinoPageModifiedTime(slug, updatedAt)` - For casino pages
- `getLegalPageModifiedTime(slug, updatedAt)` - For legal pages

### Page Types Supported

#### Homepage (`/`)
- Considers recent casino updates
- Checks for page checks with slug `'homepage'`
- Updates when any casino is modified or when page checks are performed

#### Casino Pages (`/[slug]`)
- Uses casino's `updatedAt` timestamp
- Checks for page checks matching the casino's slug
- Updates when casino content is modified or when page checks are performed

#### Legal Pages (`/privacy`, `/terms`, `/contact`)
- Uses legal page's `updatedAt` timestamp
- Checks for page checks matching the page slug
- Updates when legal content is modified or when page checks are performed

## Page Check Integration

The system integrates with the existing page check functionality:

- **Manual Page Checks**: When admins perform page checks through the admin panel
- **Automatic Page Checks**: When scheduled page checks run
- **Bulk Page Checks**: When multiple pages are checked simultaneously

Each page check creates a timestamp that can become the page's modified time if it's more recent than the content update time.

## Benefits

1. **SEO Optimization**: Search engines see accurate modification times
2. **Social Media**: Better cache control for social media sharing
3. **Freshness Signals**: Indicates when pages have been reviewed/updated
4. **Automated Updates**: No manual intervention required

## Usage Examples

### Manual Page Check Impact
When an admin checks a casino page:
1. Page check is recorded with current timestamp
2. Next page load will show the check timestamp as modified time
3. Meta tags are automatically updated

### Content Update Impact
When casino content is updated:
1. Database record `updatedAt` is updated
2. Modified time reflects the content update
3. Until a newer page check is performed

### Homepage Updates
Homepage modified time updates when:
- Any casino is updated
- Homepage page checks are performed
- Most recent timestamp is used

## Technical Implementation

The system uses:
- **Prisma ORM**: Database queries for timestamps
- **Next.js Metadata API**: Dynamic meta tag generation
- **Server-side Generation**: All calculations happen at build/request time
- **Error Handling**: Graceful fallbacks to current time

## Cache Considerations

- Pages use `export const dynamic = 'force-dynamic'` to ensure fresh data
- Modified time is calculated on each request for accuracy
- No caching of calculated timestamps to ensure real-time updates

## Testing

The system has been tested to ensure:
- Page checks immediately update modified times
- Content updates are reflected in modified times
- Homepage considers multiple data sources
- Error conditions are handled gracefully

## Future Enhancements

Potential improvements:
- Bulk update optimization
- Caching strategies for high-traffic scenarios
- Integration with more content types
- Real-time notifications of modified time changes 