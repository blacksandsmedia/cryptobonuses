// Railway Image Service Configuration
export const RAILWAY_IMAGE_SERVICE_CONFIG = {
  baseUrl: 'https://tenuous-story-production.up.railway.app',
  secretKey: 'cryptobonuses-image-service-2024',
  signatureSecretKey: 'cryptobonuses-signature-key-2024',
  enabled: process.env.NODE_ENV === 'production' || !!process.env.RAILWAY_ENVIRONMENT,
};

// Helper function to get image service instance
export function getImageServiceConfig() {
  return RAILWAY_IMAGE_SERVICE_CONFIG;
}

// Check if Railway Image Service is available
export function isRailwayImageServiceEnabled(): boolean {
  return RAILWAY_IMAGE_SERVICE_CONFIG.enabled && 
         !!RAILWAY_IMAGE_SERVICE_CONFIG.baseUrl && 
         !!RAILWAY_IMAGE_SERVICE_CONFIG.secretKey;
} 