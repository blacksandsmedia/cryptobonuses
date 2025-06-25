# Railway Image Service Integration Guide

## Overview
This guide explains how to integrate Railway's Image Service template with your crypto casino platform to solve persistent file upload issues.

## Why Railway Image Service?

### Current Problems:
- ❌ Ephemeral file system loses uploads on deployment
- ❌ JWT authentication complexity
- ❌ Manual file management
- ❌ No image optimization

### Railway Image Service Benefits:
- ✅ **Persistent Storage** - Files survive deployments
- ✅ **Built-in Authentication** - Simplified upload security
- ✅ **Image Optimization** - Automatic resizing, compression, WebP conversion
- ✅ **CDN Integration** - Fast global delivery
- ✅ **API-First** - Easy integration with existing platform

## Integration Steps

### Step 1: Deploy Railway Image Service
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from Template"
4. Choose "Image Service" template
5. Deploy the service

### Step 2: Configure Environment Variables
In your main crypto casino project, add:
```env
IMAGE_SERVICE_URL=https://your-image-service.railway.app
IMAGE_SERVICE_API_KEY=your-generated-api-key
```

### Step 3: Update Upload API
Replace the current upload logic with Railway Image Service integration:

```typescript
// src/app/api/upload/route.ts
export async function POST(request: Request) {
  // ... authentication logic ...
  
  const formData = await request.formData();
  const file = formData.get("file") as File;
  
  // Upload to Railway Image Service
  const imageServiceFormData = new FormData();
  imageServiceFormData.append('file', file);
  
  const response = await fetch(`${process.env.IMAGE_SERVICE_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.IMAGE_SERVICE_API_KEY}`
    },
    body: imageServiceFormData
  });
  
  const result = await response.json();
  
  return NextResponse.json({
    url: result.url, // Persistent URL from image service
    filename: result.filename
  });
}
```

### Step 4: Update Image Components
Modify your image components to use the service URLs:

```typescript
// Image URLs will be like: https://your-image-service.railway.app/images/[id]
<OptimizedImage
  src={casino.logo} // Already the full URL from image service
  alt={generateImageAltText(casino.name, 'logo')}
  width={64}
  height={64}
  className="logo-crisp"
/>
```

## Migration Strategy

### Phase 1: Set Up Service
1. Deploy Railway Image Service
2. Test with new uploads
3. Verify persistence across deployments

### Phase 2: Migrate Existing Images
1. Create migration script to upload existing images
2. Update database with new URLs
3. Test image loading

### Phase 3: Clean Up
1. Remove old upload logic
2. Clean up local file handling
3. Update documentation

## Configuration Options

### Image Processing
The service can be configured for:
- **Automatic WebP conversion**
- **Multiple size variants** (thumbnail, medium, large)
- **Quality optimization**
- **Format validation**

### Security
- **API key authentication**
- **File type restrictions**
- **Size limits**
- **Rate limiting**

## Benefits for Crypto Casino Platform

1. **Reliable Logo Uploads** - No more lost casino logos
2. **Performance** - Optimized images load faster
3. **SEO Benefits** - Better image optimization
4. **Scalability** - Handles traffic spikes
5. **Maintenance** - No file system management needed

## Cost Considerations
- Railway Image Service: ~$5-20/month depending on usage
- Benefits: Eliminates development time, improves reliability
- ROI: Faster development, better user experience

## Next Steps
1. Deploy the Railway Image Service template
2. Update environment variables
3. Test with a single casino logo upload
4. Migrate existing images if successful
5. Update all upload functionality

This approach eliminates the ephemeral file system issues and provides a professional image handling solution. 