# Image Upload Fix for Railway Deployment

## Problem
The upload functionality works locally but fails on Railway deployment due to JWT secret mismatch and ephemeral file system issues.

## Root Cause
- **Local**: Uses fallback JWT secret `'cryptobonuses-jwt-secret-2024'`
- **Production**: Uses different `AUTH_SECRET` value
- **File Storage**: Railway has ephemeral file system - uploaded files are lost on restart/redeploy

## Solution

### Step 1: Fix JWT Authentication

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Select your project
3. Click on "Variables" tab
4. Add this environment variable:
   ```
   AUTH_SECRET=cryptobonuses-jwt-secret-2024
   ```

### Step 2: Set Up Persistent File Storage (Recommended)

Railway supports persistent volumes for file storage. This ensures uploaded files persist across deployments.

#### Option A: Using Railway CLI (Recommended)

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Link to your project:
   ```bash
   railway link
   ```

4. Create a persistent volume:
   ```bash
   railway volume create --name uploads --size 1GB --mount-path /app/uploads
   ```

5. Set the volume mount path environment variable:
   ```bash
   railway variables set RAILWAY_VOLUME_MOUNT_PATH=/app/uploads
   ```

6. Deploy your changes:
   ```bash
   railway deploy
   ```

#### Option B: Using Railway Dashboard

1. Go to your Railway project dashboard
2. Click on "Volumes" tab
3. Click "Create Volume"
4. Set:
   - **Name**: `uploads`
   - **Size**: `1GB` (or more as needed)
   - **Mount Path**: `/app/uploads`
5. Add environment variable:
   - `RAILWAY_VOLUME_MOUNT_PATH` = `/app/uploads`
6. Redeploy your application

### Step 3: Verify Setup

After deployment, your uploaded files will:
- Be stored in the persistent volume at `/app/uploads/uploads/`
- Persist across deployments and restarts
- Be served via `/api/files/[filename]` endpoint

### Troubleshooting

#### If uploads still fail:
1. Check Railway logs for authentication errors
2. Verify `AUTH_SECRET` environment variable is set correctly
3. Ensure persistent volume is mounted properly

#### If files aren't persisting:
1. Verify the volume is created and mounted
2. Check `RAILWAY_VOLUME_MOUNT_PATH` environment variable
3. Look for volume-related errors in Railway logs

#### Test your setup:
1. Upload a file via admin interface
2. Check if file URL returns the image
3. Redeploy and verify file still exists

### Environment Variables Summary

Required environment variables for Railway:
```
AUTH_SECRET=cryptobonuses-jwt-secret-2024
RAILWAY_VOLUME_MOUNT_PATH=/app/uploads (if using persistent volume)
```

### File Storage Locations

- **Local Development**: `public/uploads/`
- **Railway (no volume)**: `public/uploads/` (ephemeral)
- **Railway (with volume)**: `/app/uploads/uploads/` (persistent)

## How It Works

1. **Authentication**: JWT token verified with consistent secret
2. **File Upload**: Files saved to appropriate directory based on environment
3. **File Serving**: 
   - With volume: Custom API endpoint `/api/files/[filename]`
   - Without volume: Standard Next.js static files `/uploads/[filename]`
4. **Persistence**: Files persist across deployments when using Railway volumes

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