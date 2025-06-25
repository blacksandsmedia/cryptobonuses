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
if (typeof window === 'undefined') {
  // Only run on server side
  initializeApp().catch(console.error);
} 