const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Railway database URL
const RAILWAY_DATABASE_URL = "postgresql://postgres:sfMJppsPfMKvFQUYOuWWgIvXdvoGwkCV@crossover.proxy.rlwy.net:51878/railway";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: RAILWAY_DATABASE_URL
    }
  }
});

// Function to normalize casino name to match logo filename
function normalizeLogoName(casinoName) {
  // Remove special characters and spaces, but keep the basic structure
  return casinoName
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special chars except spaces
    .replace(/\s+/g, '') // Remove spaces
    .toLowerCase();
}

// Function to find matching logo file
function findLogoFile(casinoName, logoFiles) {
  const normalized = normalizeLogoName(casinoName);
  
  // Direct matches first
  const directMatch = logoFiles.find(file => {
    const fileName = file.replace(' Logo.png', '').toLowerCase();
    return fileName === normalized;
  });
  
  if (directMatch) return directMatch;
  
  // Partial matches
  const partialMatch = logoFiles.find(file => {
    const fileName = file.replace(' Logo.png', '').toLowerCase();
    return fileName.includes(normalized) || normalized.includes(fileName);
  });
  
  return partialMatch;
}

async function fixLogoPathsInRailway() {
  console.log('Fixing logo paths in Railway database...');
  console.log('Database URL:', RAILWAY_DATABASE_URL.replace(/:[^:@]*@/, ':****@'));

  try {
    // Test connection
    await prisma.$connect();
    console.log('✓ Connected to Railway database');

    // Get list of logo files
    const imagesDir = path.join(__dirname, '..', 'public', 'images');
    const logoFiles = fs.readdirSync(imagesDir)
      .filter(file => file.endsWith(' Logo.png'));

    console.log(`Found ${logoFiles.length} logo files in public/images/`);

    // Get all casinos
    const casinos = await prisma.casino.findMany({
      select: {
        id: true,
        name: true,
        logo: true
      }
    });

    console.log(`Found ${casinos.length} casinos to update`);

    let updatedCount = 0;
    let notFoundCount = 0;

    for (const casino of casinos) {
      const logoFile = findLogoFile(casino.name, logoFiles);
      
      if (logoFile) {
        const newLogoPath = `/images/${logoFile}`;
        
        await prisma.casino.update({
          where: { id: casino.id },
          data: { logo: newLogoPath }
        });
        
        console.log(`✓ Updated ${casino.name}: ${newLogoPath}`);
        updatedCount++;
      } else {
        console.log(`❌ No logo found for: ${casino.name}`);
        notFoundCount++;
      }
    }

    console.log('\n=== Summary ===');
    console.log(`✓ Updated: ${updatedCount} casinos`);
    console.log(`❌ Not found: ${notFoundCount} casinos`);
    console.log('✓ Logo paths fixed in Railway database');

  } catch (error) {
    console.error('❌ Error fixing logo paths:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('✓ Database connection closed');
  }
}

fixLogoPathsInRailway()
  .catch((e) => {
    console.error('Failed to fix logo paths:', e);
    process.exit(1);
  }); 