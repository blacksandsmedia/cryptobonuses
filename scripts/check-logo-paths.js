const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function checkLogoPaths() {
  try {
    console.log('🔍 Checking casino logo paths and file existence...\n');
    
    // Get all casinos with their logo paths
    const casinos = await prisma.casino.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true
      },
      orderBy: { name: 'asc' }
    });

    console.log(`Found ${casinos.length} casinos in database\n`);

    let foundFiles = 0;
    let missingFiles = 0;
    let noLogoPath = 0;

    const rootDir = process.cwd();
    
    for (const casino of casinos) {
      console.log(`\n📋 ${casino.name} (${casino.slug})`);
      console.log(`   Database logo path: ${casino.logo || 'NULL'}`);
      
      if (!casino.logo) {
        console.log(`   ❌ No logo path in database`);
        noLogoPath++;
        continue;
      }

      // Check if file exists
      let filePath;
      if (casino.logo.startsWith('/')) {
        // Absolute path from root
        filePath = path.join(rootDir, 'public', casino.logo.substring(1));
      } else {
        // Relative path
        filePath = path.join(rootDir, 'public', casino.logo);
      }

      const fileExists = fs.existsSync(filePath);
      
      if (fileExists) {
        console.log(`   ✅ File exists at: ${filePath}`);
        foundFiles++;
      } else {
        console.log(`   ❌ File NOT found at: ${filePath}`);
        missingFiles++;
        
        // Check alternative locations
        const alternativePaths = [
          path.join(rootDir, 'public', 'images', `${casino.name} Logo.png`),
          path.join(rootDir, 'public', 'images', `${casino.name.replace(/\s+/g, '')} Logo.png`),
          path.join(rootDir, 'public', 'images', `${casino.name.replace(/[^a-zA-Z0-9]/g, '')} Logo.png`)
        ];

        console.log(`   🔍 Checking alternative locations:`);
        for (const altPath of alternativePaths) {
          if (fs.existsSync(altPath)) {
            console.log(`   ✅ Alternative found: ${altPath}`);
            break;
          }
        }
      }

      // Show what the schema would generate
      const schemaUrl = casino.logo.startsWith('http') 
        ? casino.logo 
        : `https://cryptobonuses.com${casino.logo.startsWith('/') ? casino.logo : '/' + casino.logo}`;
      console.log(`   🔗 Schema URL would be: ${schemaUrl}`);
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Files found: ${foundFiles}`);
    console.log(`   ❌ Files missing: ${missingFiles}`);
    console.log(`   ⚠️  No logo path: ${noLogoPath}`);
    console.log(`   📁 Total casinos: ${casinos.length}`);

    // Check uploads directory
    const uploadsDir = path.join(rootDir, 'public', 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const uploadedFiles = fs.readdirSync(uploadsDir).filter(file => 
        file.toLowerCase().endsWith('.png') || 
        file.toLowerCase().endsWith('.jpg') || 
        file.toLowerCase().endsWith('.jpeg') ||
        file.toLowerCase().endsWith('.webp')
      );
      console.log(`\n📁 Uploads directory has ${uploadedFiles.length} image files`);
      
      if (uploadedFiles.length > 0) {
        console.log(`   Recent uploads:`);
        uploadedFiles.slice(-5).forEach(file => {
          console.log(`   - ${file}`);
        });
      }
    } else {
      console.log(`\n❌ Uploads directory does not exist: ${uploadsDir}`);
    }

    // Check images directory
    const imagesDir = path.join(rootDir, 'public', 'images');
    if (fs.existsSync(imagesDir)) {
      const imageFiles = fs.readdirSync(imagesDir).filter(file => 
        file.toLowerCase().includes('logo') && (
          file.toLowerCase().endsWith('.png') || 
          file.toLowerCase().endsWith('.jpg') || 
          file.toLowerCase().endsWith('.jpeg')
        )
      );
      console.log(`\n📁 Images directory has ${imageFiles.length} logo files`);
      
      if (imageFiles.length > 0) {
        console.log(`   Logo files found:`);
        imageFiles.slice(0, 10).forEach(file => {
          console.log(`   - ${file}`);
        });
        if (imageFiles.length > 10) {
          console.log(`   ... and ${imageFiles.length - 10} more`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error checking logo paths:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkLogoPaths(); 