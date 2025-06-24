# 301 Redirect System Test Guide

## What was implemented:

1. **Database Model**: Added `SlugRedirect` table to track old slugs and their new targets
2. **Middleware**: Created middleware.ts to handle 301 redirects automatically
3. **API Routes**: Created `/api/redirects` to manage redirects
4. **Admin Integration**: Updated casino edit form to create redirects when slugs change
5. **Admin Interface**: Added `/admin/redirects` page to view and manage redirects

## How to test:

### Test 1: Create a redirect by changing a casino slug

1. Go to `/admin/casinos`
2. Edit any casino
3. Change the slug field (e.g., from `1xbit` to `1xbit-new`)
4. Save the casino
5. A redirect should be automatically created

### Test 2: Verify the redirect works

1. After changing a slug, visit the old URL (e.g., `/1xbit`)
2. You should be automatically redirected to the new URL (e.g., `/1xbit-new`) with a 301 status
3. Check browser developer tools Network tab to confirm it's a 301 redirect

### Test 3: View redirects in admin

1. Go to `/admin/redirects`
2. You should see the redirect you created
3. Test deleting redirects from this interface

### Test 4: API testing

```bash
# Create a redirect
curl -X POST http://localhost:3000/api/redirects \
  -H "Content-Type: application/json" \
  -d '{"oldSlug": "test-old", "newSlug": "test-new", "entityType": "casino"}'

# List redirects
curl http://localhost:3000/api/redirects

# Delete a redirect
curl -X DELETE "http://localhost:3000/api/redirects?oldSlug=test-old"
```

## Expected behavior:

- ✅ Old URLs return 301 redirects to new URLs
- ✅ Redirects are created automatically when casino slugs change
- ✅ Admin can view and manage redirects
- ✅ SEO is preserved with proper 301 status codes
- ✅ No 404 errors for changed slugs 