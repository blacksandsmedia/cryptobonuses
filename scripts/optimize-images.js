const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Image optimization settings
const OPTIMIZATION_CONFIG = {
  webp: {
    quality: 85,
    effort: 6
  },
  png: {
    compressionLevel: 9,
    quality: 85
  },
  jpeg: {
    quality: 85,
    progressive: true
  }
};

// Target sizes for casino logos
const LOGO_SIZES = [
  { width: 64, height: 64, suffix: '' },
  { width: 128, height: 128, suffix: '@2x' },
  { width: 32, height: 32, suffix: '_small' }
];

async function optimizeImage(inputPath, outputDir, filename) {
  try {
    const ext = path.extname(filename).toLowerCase();
    const name = path.basename(filename, ext);
    
    // Read the image
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    console.log(`📸 Processing: ${filename} (${metadata.width}x${metadata.height})`);
    
    // Create WebP version (best compression)
    const webpPath = path.join(outputDir, `${name}.webp`);
    await image
      .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp(OPTIMIZATION_CONFIG.webp)
      .toFile(webpPath);
    
    // Create optimized PNG version (fallback)
    const pngPath = path.join(outputDir, `${name}.png`);
    await image
      .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png(OPTIMIZATION_CONFIG.png)
      .toFile(pngPath);
    
    // Get file sizes
    const webpSize = fs.statSync(webpPath).size;
    const pngSize = fs.statSync(pngPath).size;
    const originalSize = fs.statSync(inputPath).size;
    
    const webpSavings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);
    const pngSavings = ((originalSize - pngSize) / originalSize * 100).toFixed(1);
    
    console.log(`  ✅ WebP: ${(webpSize / 1024).toFixed(1)}KB (${webpSavings}% smaller)`);
    console.log(`  ✅ PNG: ${(pngSize / 1024).toFixed(1)}KB (${pngSavings}% smaller)`);
    
    return {
      original: originalSize,
      webp: webpSize,
      png: pngSize,
      webpSavings: parseFloat(webpSavings),
      pngSavings: parseFloat(pngSavings)
    };
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error.message);
    return null;
  }
}

async function optimizeAllImages() {
  const inputDir = path.join(__dirname, '..', 'public', 'images');
  const outputDir = path.join(__dirname, '..', 'public', 'images', 'optimized');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log('🚀 Starting image optimization...\n');
  
  try {
    const files = fs.readdirSync(inputDir);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.png', '.jpg', '.jpeg', '.webp'].includes(ext) && 
             file.toLowerCase().includes('logo') &&
             !file.startsWith('.');
    });
    
    console.log(`Found ${imageFiles.length} logo images to optimize\n`);
    
    let totalStats = {
      originalSize: 0,
      webpSize: 0,
      pngSize: 0,
      processedCount: 0
    };
    
    for (const file of imageFiles) {
      const inputPath = path.join(inputDir, file);
      const stats = await optimizeImage(inputPath, outputDir, file);
      
      if (stats) {
        totalStats.originalSize += stats.original;
        totalStats.webpSize += stats.webp;
        totalStats.pngSize += stats.png;
        totalStats.processedCount++;
      }
      
      console.log(''); // Empty line for readability
    }
    
    // Summary
    console.log('📊 Optimization Summary:');
    console.log('=======================');
    console.log(`📁 Processed: ${totalStats.processedCount} images`);
    console.log(`📉 Original size: ${(totalStats.originalSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`🎯 WebP total: ${(totalStats.webpSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`📱 PNG total: ${(totalStats.pngSize / 1024 / 1024).toFixed(2)}MB`);
    
    const webpSavings = ((totalStats.originalSize - totalStats.webpSize) / totalStats.originalSize * 100).toFixed(1);
    const pngSavings = ((totalStats.originalSize - totalStats.pngSize) / totalStats.originalSize * 100).toFixed(1);
    
    console.log(`💰 WebP savings: ${webpSavings}%`);
    console.log(`💰 PNG savings: ${pngSavings}%`);
    
    console.log('\n✅ Image optimization complete!');
    console.log(`📂 Optimized images saved to: ${outputDir}`);
    
  } catch (error) {
    console.error('❌ Error during optimization:', error);
  }
}

// Run if called directly
if (require.main === module) {
  optimizeAllImages();
}

module.exports = { optimizeAllImages }; 