# Production Redirect Fix Guide

## Issue: Redirects work locally but not in production

The redirects we added to `redirects.config.js` work locally but aren't working in production because:

1. **Next.js loads redirects at build time** - not runtime
2. **Production deployment needed** - server must be redeployed to pick up new redirects  
3. **Caching issues** - browsers/CDN may cache old responses

## Solution Steps:

### 1. Redeploy Production (Required)
```bash
# If using Vercel, Netlify, or similar:
git push origin main  # Triggers automatic deployment

# If using Railway:
# Dashboard will automatically redeploy on git push

# If using manual deployment:
npm run build
# Then restart your production server
```

### 2. Clear Browser Cache (For testing)
```
# Test redirects in incognito/private browsing mode
# Or clear browser cache completely
```

### 3. Test Redirects After Deployment
```bash
# Test the specific redirects that weren't working:
curl -I "https://cryptobonuses.com/phemex"
curl -I "https://cryptobonuses.com/bitfinex"

# Should return:
# HTTP/1.1 301 Moved Permanently
# location: /
```

### 4. Alternative: Database-Based Redirects (If needed)
If the config-based redirects continue having issues, we can add them to the database instead:

```sql
INSERT INTO "SlugRedirect" ("oldSlug", "newSlug", "entityType", "createdAt", "updatedAt") 
VALUES 
  ('phemex', '', 'other', NOW(), NOW()),
  ('primexbt', '', 'other', NOW(), NOW()),
  ('app', '', 'other', NOW(), NOW()),
  ('crypto-com', '', 'other', NOW(), NOW()),
  ('kucoin', '', 'other', NOW(), NOW()),
  ('bingx', '', 'other', NOW(), NOW()),
  ('bitfinex', '', 'other', NOW(), NOW()),
  ('stormgain', '', 'other', NOW(), NOW()),
  ('csgoempire', '', 'other', NOW(), NOW()),
  ('pixel-gg', '', 'other', NOW(), NOW());
```

Then regenerate the config:
```bash
node scripts/generate-redirects.js
```

## Why This Happened:
- We manually edited `redirects.config.js` instead of using the database system
- Production server was still running the old build without the new redirects
- Next.js redirect config is static, loaded once at build time

## Prevention:
- Always use the database + admin panel for adding redirects
- Or ensure production redeployment after manual config changes
- Test redirects in production after any redirect-related changes 