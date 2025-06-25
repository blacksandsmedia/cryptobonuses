# Image Upload & GitHub Sync Guide

This guide explains how uploaded images on your Railway production site can be stored in `public/images/` and synced with your GitHub repository.

## Current Changes Made

### 1. Updated Upload APIs
- Modified `/api/upload/route.ts` to store images in `public/images/` instead of `public/uploads/`
- Updated `/api/users/profile-picture/route.ts` for profile pictures
- Updated `/api/casinos/import-csv/route.ts` for CSV imports

### 2. File Structure
```
public/
├── images/
│   ├── [existing casino logos].png
│   ├── profile-pictures/
│   │   └── [user profile pictures]
│   └── [newly uploaded images]
└── uploads/  # No longer used
```

## The Challenge: Railway + Git Sync

### Problem
- Railway's filesystem is **ephemeral** - files uploaded during runtime don't persist between deployments
- Images uploaded on production need to be committed to Git to become permanent
- Railway doesn't have direct Git write access

### Solutions

## Option 1: Manual Sync (Recommended for Low Volume)

Use the provided script to manually sync images:

```bash
# List current images
node scripts/sync-images-to-git.js list

# Sync new images to Git
node scripts/sync-images-to-git.js sync

# Clean up temporary files
node scripts/sync-images-to-git.js cleanup
```

## Option 2: Scheduled Sync (For Regular Updates)

### A. Railway Cron Job
Add to your Railway service:

```bash
# In Railway dashboard, add a cron service
# Command: node scripts/sync-images-to-git.js sync
# Schedule: 0 */6 * * * (every 6 hours)
```

### B. GitHub Actions Workflow
Create `.github/workflows/sync-images.yml`:

```yaml
name: Sync Images from Railway

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:  # Manual trigger

jobs:
  sync-images:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Download images from Railway
        env:
          RAILWAY_API_TOKEN: ${{ secrets.RAILWAY_API_TOKEN }}
        run: |
          # Script to download images from Railway volume/storage
          # This requires Railway API integration
          
      - name: Commit and push if changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add public/images/
          git diff --staged --quiet || (git commit -m "Auto-sync: Update images from Railway" && git push)
```

## Option 3: Real-time Sync (Advanced)

### Webhook-based Solution
Modify your upload API to trigger Git operations:

```javascript
// Add to your upload API after successful upload
if (process.env.NODE_ENV === 'production') {
  // Queue image for Git sync
  await queueImageForSync(fileName, fileUrl);
}
```

### Implementation Steps:

1. **Install Git in Railway**:
   Add to your `package.json`:
   ```json
   {
     "scripts": {
       "postinstall": "apt-get update && apt-get install -y git || echo 'Git already installed'"
     }
   }
   ```

2. **Configure Git credentials**:
   ```bash
   # In Railway environment variables
   GIT_USER_NAME=your-github-username
   GIT_USER_EMAIL=your-email@example.com
   GITHUB_TOKEN=your-personal-access-token
   ```

3. **Create sync service**:
   ```javascript
   // lib/git-sync.js
   const { execSync } = require('child_process');
   
   export async function syncImageToGit(fileName) {
     try {
       execSync(`git config --global user.name "${process.env.GIT_USER_NAME}"`);
       execSync(`git config --global user.email "${process.env.GIT_USER_EMAIL}"`);
       execSync(`git add public/images/${fileName}`);
       execSync(`git commit -m "Add uploaded image: ${fileName}"`);
       execSync(`git push https://${process.env.GITHUB_TOKEN}@github.com/yourusername/yourrepo.git main`);
     } catch (error) {
       console.error('Failed to sync image to Git:', error);
     }
   }
   ```

## Option 4: Cloud Storage (Recommended for Production)

For a more robust solution, consider using cloud storage:

1. **AWS S3 / Cloudinary / Supabase Storage**
2. **Benefits**: 
   - Persistent storage
   - CDN delivery
   - Image optimization
   - No Git bloat

## Current Status

✅ **Completed:**
- Upload APIs now store in `public/images/`
- Sync script created
- Documentation provided

⚠️ **Important Notes:**
1. Test the sync script locally first
2. Railway may lose uploaded images on redeploy until synced
3. Consider implementing Option 4 for production scale

## Testing the Changes

1. **Deploy to Railway**: Your changes are ready to deploy
2. **Upload an image**: Use the admin panel to upload a casino logo
3. **Verify location**: Image should appear in `public/images/`
4. **Run sync**: Use the script to commit to Git

## Environment Variables Needed

For automatic syncing, add these to Railway:

```bash
GIT_USER_NAME=your-github-username
GIT_USER_EMAIL=your-email@example.com
GITHUB_TOKEN=your-personal-access-token  # With repo write permissions
```

## Usage Examples

```bash
# Check what images exist
node scripts/sync-images-to-git.js list

# Sync new images to GitHub
node scripts/sync-images-to-git.js sync

# View sync script help
node scripts/sync-images-to-git.js
```

---

**Need help?** The sync script includes detailed logging to help debug any issues. 