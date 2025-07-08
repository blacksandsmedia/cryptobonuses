import { ensureUploadDir } from './upload-utils';

/**
 * Initialize application on startup
 * This should be called when the application starts
 */
export async function initializeApp() {
  try {
    console.log('🚀 Initializing application...');
    
    // Ensure upload directory exists
    await ensureUploadDir();
    
    console.log('✅ Application initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    // Don't throw error to prevent app from crashing
    // Log it and continue
  }
}

// Auto-initialize when this module is imported
// This ensures the upload directory is created at startup
// But only if we're not in build mode
if (typeof window === 'undefined') {
  // Only run on server side and not during build phase
  // Check if we're in a build environment by looking for specific build indicators
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                     process.env.NEXT_PHASE === 'phase-export' ||
                     process.argv.includes('build') ||
                     process.argv.includes('next:build');
  
  if (!isBuildTime) {
    initializeApp().catch(console.error);
  }
} 