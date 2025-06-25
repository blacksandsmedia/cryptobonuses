const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Migrate uploaded images from public/uploads to public/images
 * and update database references
 */
async function migrateUploadsToImages() {
  console.log('🔄 Starting migration from uploads to images folder...');
  
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  const imagesDir = path.join(process.cwd(), 'public', 'images');
  
  // Check if uploads directory exists
  if (!fs.existsSync(uploadsDir)) {
    console.log('📁 No uploads directory found, nothing to migrate');
    return;
  }
  
  // Ensure images directory exists
  if (!fs.existsSync(imagesDir)) {
    console.log('📁 Creating images directory...');
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  
  // Get all files in uploads directory
  const files = fs.readdirSync(uploadsDir, { withFileTypes: true });
  const imageFiles = files.filter(file => 
    file.isFile() && /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name)
  );
  
  console.log(`📸 Found ${imageFiles.length} image files to migrate`);
  
  const migrations = [];
  let migratedCount = 0;
  let errorCount = 0;
  
  // Copy files and track migrations
  for (const file of imageFiles) {
    try {
      const sourcePath = path.join(uploadsDir, file.name);
      const destPath = path.join(imagesDir, file.name);
      
      // Check if destination already exists
      if (fs.existsSync(destPath)) {
        console.log(`⚠️  Skipping ${file.name} - already exists in images folder`);
        continue;
      }
      
      // Copy file
      fs.copyFileSync(sourcePath, destPath);
      
      migrations.push({
        oldPath: `/uploads/${file.name}`,
        newPath: `/images/${file.name}`,
        fileName: file.name
      });
      
      migratedCount++;
      console.log(`✅ Migrated: ${file.name}`);
      
    } catch (error) {
      console.error(`❌ Error migrating ${file.name}:`, error.message);
      errorCount++;
    }
  }
  
  // Update database references
  if (migrations.length > 0) {
    console.log('\n🔄 Updating database references...');
    
    try {
      // Update casino logos
      for (const migration of migrations) {
        const casinosUpdated = await prisma.casino.updateMany({
          where: { logo: migration.oldPath },
          data: { logo: migration.newPath }
        });
        
        if (casinosUpdated.count > 0) {
          console.log(`📝 Updated ${casinosUpdated.count} casino logo(s): ${migration.fileName}`);
        }
        
        // Update casino featured images
        const featuredUpdated = await prisma.casino.updateMany({
          where: { featuredImage: migration.oldPath },
          data: { featuredImage: migration.newPath }
        });
        
        if (featuredUpdated.count > 0) {
          console.log(`📝 Updated ${featuredUpdated.count} featured image(s): ${migration.fileName}`);
        }
        
        // Update casino screenshots
        const casinos = await prisma.casino.findMany({
          where: {
            screenshots: {
              hasSome: [migration.oldPath]
            }
          }
        });
        
        for (const casino of casinos) {
          const updatedScreenshots = casino.screenshots.map(screenshot =>
            screenshot === migration.oldPath ? migration.newPath : screenshot
          );
          
          await prisma.casino.update({
            where: { id: casino.id },
            data: { screenshots: updatedScreenshots }
          });
          
          console.log(`📝 Updated screenshots for casino: ${casino.name}`);
        }
        
        // Update user profile pictures
        const profileUpdated = await prisma.user.updateMany({
          where: { profilePicture: migration.oldPath },
          data: { profilePicture: migration.newPath }
        });
        
        if (profileUpdated.count > 0) {
          console.log(`📝 Updated ${profileUpdated.count} profile picture(s): ${migration.fileName}`);
        }
      }
      
    } catch (error) {
      console.error('❌ Error updating database:', error.message);
    }
  }
  
  // Summary
  console.log('\n📊 Migration Summary:');
  console.log(`✅ Successfully migrated: ${migratedCount} files`);
  console.log(`❌ Errors: ${errorCount} files`);
  console.log(`📝 Database references updated for ${migrations.length} files`);
  
  if (migratedCount > 0) {
    console.log('\n🎉 Migration completed successfully!');
    console.log('📌 Next steps:');
    console.log('1. Test your site to ensure images are loading correctly');
    console.log('2. If everything works, you can safely delete the uploads folder');
    console.log('3. Run: node scripts/sync-images-to-git.js sync');
  }
}

/**
 * Clean up old uploads folder after successful migration
 */
async function cleanupUploadsFolder() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    console.log('📁 No uploads folder to clean up');
    return;
  }
  
  try {
    const files = fs.readdirSync(uploadsDir);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|webp|gif)$/i.test(file)
    );
    
    console.log(`🗑️  Cleaning up ${imageFiles.length} files from uploads folder...`);
    
    for (const file of imageFiles) {
      const filePath = path.join(uploadsDir, file);
      fs.unlinkSync(filePath);
      console.log(`🗑️  Deleted: ${file}`);
    }
    
    console.log('✅ Uploads folder cleanup completed');
    
  } catch (error) {
    console.error('❌ Error cleaning up uploads folder:', error.message);
  }
}

/**
 * List files in both directories for comparison
 */
function compareDirectories() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  const imagesDir = path.join(process.cwd(), 'public', 'images');
  
  console.log('📂 Directory Comparison:');
  
  // List uploads
  if (fs.existsSync(uploadsDir)) {
    const uploadsFiles = fs.readdirSync(uploadsDir)
      .filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file));
    console.log(`\n📁 Uploads folder: ${uploadsFiles.length} image files`);
    uploadsFiles.forEach(file => console.log(`  - ${file}`));
  } else {
    console.log('\n📁 Uploads folder: does not exist');
  }
  
  // List images
  if (fs.existsSync(imagesDir)) {
    const imagesFiles = fs.readdirSync(imagesDir)
      .filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file));
    console.log(`\n📁 Images folder: ${imagesFiles.length} image files`);
    imagesFiles.slice(0, 10).forEach(file => console.log(`  - ${file}`));
    if (imagesFiles.length > 10) {
      console.log(`  ... and ${imagesFiles.length - 10} more files`);
    }
  } else {
    console.log('\n📁 Images folder: does not exist');
  }
}

// Command line interface
const command = process.argv[2];

async function main() {
  try {
    switch (command) {
      case 'migrate':
        await migrateUploadsToImages();
        break;
      case 'cleanup':
        await cleanupUploadsFolder();
        break;
      case 'compare':
        compareDirectories();
        break;
      default:
        console.log(`
🔄 Upload to Images Migration Tool

Usage:
  node scripts/migrate-uploads-to-images.js <command>

Commands:
  migrate  - Copy images from uploads to images folder and update database
  cleanup  - Remove images from uploads folder (run after migration)
  compare  - Compare files in both directories

Examples:
  node scripts/migrate-uploads-to-images.js migrate
  node scripts/migrate-uploads-to-images.js compare
  node scripts/migrate-uploads-to-images.js cleanup
        `);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error); 