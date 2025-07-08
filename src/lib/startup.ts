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

// Auto-initialize when this module is imported, but only at runtime
// Skip initialization during build process
if (typeof window === 'undefined') {
  // Check if we're in a build process
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' ||
                     process.env.NODE_ENV === 'production' && process.argv.some(arg => arg.includes('build'));
  
  if (!isBuildTime) {
    // Only run initialization at actual runtime, not during build
    initializeApp().catch(console.error);
  } else {
    console.log('🏗️ Skipping initialization during build process');
  }
} 