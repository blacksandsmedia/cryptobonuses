# Image Upload Fix for Railway Deployment

## Problem
The upload functionality works locally but fails on Railway deployment due to JWT secret mismatch and image handling issues.

## Root Cause
- **Local**: Uses fallback JWT secret `'cryptobonuses-jwt-secret-2024'`
- **Production**: Uses different `AUTH_SECRET` value
- **Image Storage**: Railway supports local file storage in `/public/uploads/` directory

## Solution

### Option 1: Set Environment Variable in Railway (Recommended)

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Select your project
3. Click on "Variables" tab
4. Add this environment variable:
   ```
   AUTH_SECRET=cryptobonuses-jwt-secret-2024
   ```
5. Click "Deploy" to restart with new environment variable

### Option 2: Install Railway CLI and set via command line

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Set the environment variable
railway variables set AUTH_SECRET=cryptobonuses-jwt-secret-2024

# Deploy the changes
railway up
```

## Image Optimization Features

The updated upload system includes:

### 1. **SEO-Friendly Filenames**
- Logo uploads: `casino-name-logo-timestamp.webp`
- Featured images: `casino-name-bonus-offer-timestamp.webp`
- Screenshots: `casino-name-screenshot-timestamp.webp`

### 2. **Automatic WebP Conversion**
- All images (except GIFs) are saved as WebP for better performance
- Maintains original quality while reducing file size

### 3. **Image Validation**
- Maximum file size: 10MB
- Supported formats: JPEG, PNG, WebP, GIF
- Automatic type validation

### 4. **Railway Storage**
- Files stored in `/public/uploads/` directory
- Persistent across deployments on Railway
- No external dependencies required

### 5. **Enhanced Image Utils**
- SEO-optimized alt text generation
- Responsive image sizing
- Structured data for better SEO
- Fallback image handling

## Verification Steps

1. **Test JWT Authentication:**
   ```bash
   # Check if AUTH_SECRET is set correctly
   railway variables
   ```

2. **Test File Upload:**
   - Login to admin panel
   - Try uploading a casino logo
   - Verify file appears in `/public/uploads/`
   - Check that the image displays correctly

3. **Check Image Optimization:**
   - Uploaded images should have SEO-friendly filenames
   - Images should be converted to WebP format
   - File sizes should be optimized

## Image Best Practices

### For Casino Logos:
- **Recommended size:** 400x200px
- **Format:** PNG or WebP with transparency
- **Quality:** High (will be set to 100% automatically)

### For Featured Images:
- **Recommended size:** 1200x630px (perfect for social sharing)
- **Format:** JPEG or WebP
- **Quality:** 90% (automatically optimized)

### For Screenshots:
- **Recommended size:** 1920x1080px or 1600x900px
- **Format:** JPEG or WebP
- **Quality:** 85% (automatically optimized)

## Troubleshooting

### If uploads still fail:
1. Check Railway logs for JWT errors
2. Verify `AUTH_SECRET` environment variable is set
3. Ensure admin login is working properly
4. Check file permissions in `/public/uploads/`

### If images don't display:
1. Verify files are in `/public/uploads/` directory
2. Check image paths in database
3. Ensure Next.js image optimization is working
4. Check browser network tab for 404 errors

## Performance Benefits

- **Local Storage:** No external API calls, faster uploads
- **WebP Conversion:** Smaller file sizes, faster loading
- **SEO Optimization:** Better search engine visibility
- **Responsive Images:** Optimal loading across devices
- **Caching:** Long-term browser caching for better performance 