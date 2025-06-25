# Railway Deployment Guide - Crypto Casino with Image Service

## Overview
This guide covers deploying your crypto casino application to Railway with the integrated Railway Image Service for persistent image storage.

## Prerequisites
- Railway CLI installed and authenticated
- Railway Image Service deployed (completed ✅)
- Main application ready for deployment

## Deployed Services

### 1. Railway Image Service ✅
- **Service Name**: tenuous-story
- **URL**: https://tenuous-story-production.up.railway.app
- **Status**: Deployed and configured
- **Environment Variables**:
  - `SECRET_KEY`: cryptobonuses-image-service-2024
  - `SIGNATURE_SECRET_KEY`: cryptobonuses-signature-key-2024
  - `PORT`: 8080

## Deploying Main Application

### Step 1: Prepare Main Application
Your main application is already configured to use the Railway Image Service. The integration will:
- Use Railway Image Service in production environments
- Fall back to local storage in development
- Automatically handle image uploads and transformations

### Step 2: Deploy Main Application to Railway

1. **Initialize Railway project for main app**:
   ```bash
   railway init
   ```

2. **Set environment variables**:
   ```bash
   # Database (if using Railway PostgreSQL)
   railway variables --set DATABASE_URL="your-postgresql-connection-string"
   
   # NextAuth configuration
   railway variables --set NEXTAUTH_URL="https://your-app-domain.railway.app"
   railway variables --set NEXTAUTH_SECRET="your-nextauth-secret-key"
   
   # JWT Authentication
   railway variables --set AUTH_SECRET="cryptobonuses-jwt-secret-2024"
   
   # Railway Image Service integration (already configured in code)
   # No additional environment variables needed - using hardcoded config
   ```

3. **Deploy the application**:
   ```bash
   railway up
   ```

### Step 3: Configure Domain (Optional)
```bash
railway domain
```

## Image Upload Flow

### Development Environment
- Images uploaded to `public/uploads/` directory
- Served via Next.js static file serving
- Files persist during development

### Production Environment (Railway)
- Images uploaded to Railway Image Service
- Automatic optimization and WebP conversion
- CDN-delivered with global edge caching
- Persistent storage that survives deployments
- On-the-fly image transformations

## Features Enabled

### ✅ Persistent Image Storage
- Images survive application redeployments
- No more 404 errors from ephemeral file systems
- Professional image hosting infrastructure

### ✅ Automatic Image Optimization
- WebP conversion for better performance
- On-the-fly resizing and cropping
- Quality optimization
- SEO-friendly filenames

### ✅ Enhanced Performance
- Global CDN delivery
- Optimized image formats (AVIF/WebP)
- Responsive image serving
- Lazy loading support

### ✅ Security
- API key protected uploads
- Signed URLs for secure access
- CORS protection
- Rate limiting

## Testing the Integration

### 1. Test Image Upload
1. Go to admin panel: `/admin/casinos`
2. Edit or create a casino
3. Upload a logo image
4. Verify the image appears correctly
5. Check that the image URL uses Railway Image Service domain

### 2. Test Image Optimization
- Upload a large image
- Check that it's automatically optimized
- Verify WebP conversion in browser dev tools
- Test responsive sizing

### 3. Test Persistence
- Deploy a new version of your app
- Verify uploaded images still work
- Check that URLs remain valid

## Monitoring and Maintenance

### Railway Image Service Logs
```bash
cd /tmp/railway-image-service
railway logs
```

### Main Application Logs
```bash
railway logs
```

### Storage Usage
Monitor blob storage usage in Railway dashboard or via API:
```bash
curl https://tenuous-story-production.up.railway.app/blob \
  -H "x-api-key: cryptobonuses-image-service-2024"
```

## Troubleshooting

### Image Upload Fails
1. Check Railway Image Service is running
2. Verify API key is correct
3. Check network connectivity
4. Review application logs

### Images Not Loading
1. Verify Railway Image Service URL
2. Check CORS settings
3. Validate image URLs in database
4. Test direct image service access

### Performance Issues
1. Monitor Railway Image Service metrics
2. Check CDN cache hit rates
3. Optimize image transformations
4. Review bandwidth usage

## Cost Optimization

### Railway Image Service
- Efficient blob storage pricing
- CDN bandwidth included
- Pay-per-use model
- No minimum commitments

### Recommendations
- Use appropriate image sizes
- Leverage automatic WebP conversion
- Implement proper caching headers
- Monitor storage usage regularly

## Next Steps

1. **Deploy main application** following steps above
2. **Test all image functionality** in production
3. **Monitor performance** and costs
4. **Set up monitoring alerts** for service health
5. **Consider backup strategy** for critical images

## Support

- Railway Documentation: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Image Service Issues: Check logs and API responses

---

**Status**: Railway Image Service deployed ✅  
**Next**: Deploy main application with image service integration 