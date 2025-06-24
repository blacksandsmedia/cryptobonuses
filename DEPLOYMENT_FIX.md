# JWT Authentication Fix for Railway Deployment

## Problem
The upload functionality works locally but fails on Railway deployment due to JWT secret mismatch AND ephemeral file system.

## Root Cause
- **Local**: Uses fallback secret `'cryptobonuses-jwt-secret-2024'`
- **Production**: Uses different `AUTH_SECRET` or `NEXTAUTH_SECRET` value
- **File Storage**: Railway has ephemeral file system - uploaded files are lost on restart

## Solution

### Option 1: Set Environment Variable in Railway (Recommended)

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Select your project
3. Click on "Variables" tab
4. Add these environment variables:
   ```
   AUTH_SECRET=cryptobonuses-jwt-secret-2024
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
5. Click "Deploy" to restart with new environment variables

### Option 2: Install Railway CLI and set via command line

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Set the environment variables
railway variables set AUTH_SECRET=cryptobonuses-jwt-secret-2024
railway variables set CLOUDINARY_CLOUD_NAME=your_cloud_name
railway variables set CLOUDINARY_API_KEY=your_api_key
railway variables set CLOUDINARY_API_SECRET=your_api_secret

# Deploy
railway up
```

## Cloudinary Setup (Required for Production)

### 1. Create Cloudinary Account
1. Go to [Cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Go to Dashboard to get your credentials

### 2. Get Cloudinary Credentials
From your Cloudinary Dashboard, copy:
- **Cloud Name** (e.g., `dxyz123abc`)
- **API Key** (e.g., `123456789012345`)
- **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

### 3. Add to Railway Environment Variables
In Railway Dashboard → Variables, add:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

## How It Works

### Local Development
- Uses local file system (`public/uploads/`)
- Files persist during development
- JWT uses fallback secret

### Production (Railway)
- Uses Cloudinary for file storage
- Files persist permanently in cloud
- JWT uses environment variable secret
- Automatic WebP conversion for optimization

## Testing the Fix

### 1. Local Testing
```bash
npm run dev
# Try uploading a logo in admin panel
# Should save to public/uploads/
```

### 2. Production Testing
1. Deploy to Railway with environment variables
2. Try uploading a logo in admin panel
3. Should save to Cloudinary and return HTTPS URL
4. Verify image loads from Cloudinary CDN

## Troubleshooting

### JWT Issues
- Check Railway logs for "JWT verification error"
- Ensure `AUTH_SECRET` matches local fallback
- Clear browser cookies and re-login

### Upload Issues
- Check Railway logs for "Cloudinary not configured"
- Verify all 3 Cloudinary environment variables are set
- Test Cloudinary credentials in their dashboard

### File Access Issues
- Cloudinary URLs should start with `https://res.cloudinary.com/`
- Local URLs should start with `/uploads/`
- Check browser network tab for 404s

## Environment Variables Summary

Required for production:
```
AUTH_SECRET=cryptobonuses-jwt-secret-2024
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key  
CLOUDINARY_API_SECRET=your_api_secret
```

The upload system will automatically:
- Use Cloudinary in production (NODE_ENV=production or RAILWAY_ENVIRONMENT exists)
- Use local storage in development
- Convert images to WebP format for better performance
- Generate SEO-friendly filenames 