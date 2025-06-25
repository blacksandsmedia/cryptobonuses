const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images');
const GIT_COMMIT_MESSAGE = 'Auto-sync: Add new uploaded images';

/**
 * Sync newly uploaded images to Git repository
 * This script should be run periodically or triggered after image uploads
 */
async function syncImagesToGit() {
  try {
    console.log('🔄 Starting image sync to Git...');
    
    // Check if we're in a git repository
    try {
      execSync('git status', { stdio: 'pipe' });
    } catch (error) {
      console.error('❌ Not in a Git repository or Git not available');
      return;
    }
    
    // Check if images directory exists
    if (!fs.existsSync(IMAGES_DIR)) {
      console.log('📁 Images directory does not exist, creating it...');
      fs.mkdirSync(IMAGES_DIR, { recursive: true });
    }
    
    // Add all new images to git
    console.log('📸 Adding new images to Git...');
    execSync(`git add ${IMAGES_DIR}`, { stdio: 'pipe' });
    
    // Check if there are any changes to commit
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      if (!status.trim()) {
        console.log('✅ No new images to sync');
        return;
      }
    } catch (error) {
      console.error('❌ Error checking git status:', error.message);
      return;
    }
    
    // Commit the changes
    console.log('💾 Committing new images...');
    execSync(`git commit -m "${GIT_COMMIT_MESSAGE}"`, { stdio: 'pipe' });
    
    // Push to remote (if configured)
    try {
      console.log('🚀 Pushing to remote repository...');
      execSync('git push origin main', { stdio: 'pipe' });
      console.log('✅ Successfully synced images to GitHub!');
    } catch (error) {
      console.warn('⚠️ Could not push to remote:', error.message);
      console.log('📝 Images committed locally. Push manually when ready.');
    }
    
  } catch (error) {
    console.error('❌ Error syncing images:', error.message);
  }
}

/**
 * List all images in the images directory
 */
function listImages() {
  try {
    const images = fs.readdirSync(IMAGES_DIR)
      .filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file))
      .sort();
    
    console.log(`📸 Found ${images.length} images:`);
    images.forEach(image => {
      const filePath = path.join(IMAGES_DIR, image);
      const stats = fs.statSync(filePath);
      const sizeKB = Math.round(stats.size / 1024);
      console.log(`  - ${image} (${sizeKB}KB)`);
    });
  } catch (error) {
    console.error('❌ Error listing images:', error.message);
  }
}

/**
 * Clean up old temporary files (optional)
 */
function cleanupTempFiles() {
  try {
    const tempPattern = /temp|tmp|\d{13}/; // Look for temp files or timestamp files
    const images = fs.readdirSync(IMAGES_DIR);
    let cleaned = 0;
    
    images.forEach(file => {
      if (tempPattern.test(file)) {
        const filePath = path.join(IMAGES_DIR, file);
        const stats = fs.statSync(filePath);
        
        // Delete files older than 1 hour that match temp pattern
        if (Date.now() - stats.mtime.getTime() > 3600000) {
          console.log(`🗑️ Removing old temp file: ${file}`);
          fs.unlinkSync(filePath);
          cleaned++;
        }
      }
    });
    
    if (cleaned > 0) {
      console.log(`✅ Cleaned up ${cleaned} temporary files`);
    }
  } catch (error) {
    console.error('❌ Error cleaning temp files:', error.message);
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'sync':
    syncImagesToGit();
    break;
  case 'list':
    listImages();
    break;
  case 'cleanup':
    cleanupTempFiles();
    break;
  default:
    console.log(`
🖼️  Image Git Sync Utility

Usage:
  node scripts/sync-images-to-git.js <command>

Commands:
  sync     - Sync new images to Git repository
  list     - List all images in the images directory
  cleanup  - Clean up old temporary files

Examples:
  node scripts/sync-images-to-git.js sync
  node scripts/sync-images-to-git.js list
    `);
} 