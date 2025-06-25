interface ImageServiceConfig {
  baseUrl: string;
  secretKey: string;
  signatureSecretKey?: string;
}

interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

interface ImageMetadata {
  width?: number;
  height?: number;
  format?: string;
  quality?: number;
}

class RailwayImageService {
  private config: ImageServiceConfig;

  constructor(config: ImageServiceConfig) {
    this.config = config;
  }

  /**
   * Upload an image to the Railway Image Service
   */
  async uploadImage(
    file: File | Buffer,
    filename: string,
    metadata?: ImageMetadata
  ): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      
      if (file instanceof File) {
        formData.append('file', file, filename);
      } else {
        // For Buffer uploads (server-side)
        const blob = new Blob([file]);
        formData.append('file', blob, filename);
      }

      // Add metadata if provided
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const response = await fetch(`${this.config.baseUrl}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        return {
          success: false,
          error: `Upload failed: ${error}`,
        };
      }

      const result = await response.json();
      return {
        success: true,
        url: result.url,
      };
    } catch (error) {
      return {
        success: false,
        error: `Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get optimized image URL with transformations
   */
  getImageUrl(
    path: string,
    transformations?: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'jpeg' | 'png';
      fit?: 'cover' | 'contain' | 'fill';
    }
  ): string {
    const url = new URL(`${this.config.baseUrl}/image${path}`);
    
    if (transformations) {
      Object.entries(transformations).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, value.toString());
        }
      });
    }

    return url.toString();
  }

  /**
   * Delete an image from the service
   */
  async deleteImage(path: string): Promise<UploadResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/image${path}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        return {
          success: false,
          error: `Delete failed: ${error}`,
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Delete error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Check if an image exists
   */
  async imageExists(path: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/image${path}`, {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`,
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}

// Create singleton instance
let imageService: RailwayImageService | null = null;

export function getImageService(): RailwayImageService {
  if (!imageService) {
    const baseUrl = process.env.RAILWAY_IMAGE_SERVICE_URL;
    const secretKey = process.env.RAILWAY_IMAGE_SERVICE_SECRET;

    if (!baseUrl || !secretKey) {
      throw new Error(
        'Railway Image Service configuration missing. Please set RAILWAY_IMAGE_SERVICE_URL and RAILWAY_IMAGE_SERVICE_SECRET environment variables.'
      );
    }

    imageService = new RailwayImageService({
      baseUrl,
      secretKey,
    });
  }

  return imageService;
}

export type { ImageMetadata, UploadResponse };
export { RailwayImageService }; 