const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Railway database URL - replace with your actual Railway PostgreSQL URL
const RAILWAY_DATABASE_URL = "postgresql://postgres:sfMJppsPfMKvFQUYOuWWgIvXdvoGwkCV@crossover.proxy.rlwy.net:51878/railway";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: RAILWAY_DATABASE_URL
    }
  }
});

async function importCasinosToRailway() {
  console.log('Importing all casinos to Railway database...');
  console.log('Database URL:', RAILWAY_DATABASE_URL.replace(/:[^:@]*@/, ':****@'));
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✓ Connected to Railway database');
    
    // Read the exported data
    const exportPath = path.join(__dirname, 'exported-casinos.json');
    if (!fs.existsSync(exportPath)) {
      throw new Error('exported-casinos.json not found. Please run export-all-casinos.js first.');
    }
    
    const casinos = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
    console.log(`Found ${casinos.length} casinos to import`);
    
    // Clear existing casinos and bonuses
    console.log('Clearing existing casinos and bonuses...');
    await prisma.bonus.deleteMany({});
    await prisma.casino.deleteMany({});
    console.log('✓ Cleared existing data');
    
    // Import each casino and its bonuses
    let importedCount = 0;
    for (const casinoData of casinos) {
      const { bonuses, ...casino } = casinoData;
      
      console.log(`Creating casino: ${casino.name}`);
      
      // Create casino first
      const createdCasino = await prisma.casino.create({
        data: casino
      });
      
      // Then create all bonuses for this casino
      if (bonuses && bonuses.length > 0) {
        for (const bonus of bonuses) {
          console.log(`  - Adding bonus: ${bonus.title}`);
          await prisma.bonus.create({
            data: {
              ...bonus,
              casinoId: createdCasino.id
            }
          });
        }
      }
      
      importedCount++;
    }
    
    console.log(`\n🎉 Successfully imported ${importedCount} casinos to Railway!`);
    console.log('Your production database now has all your casinos.');
    
  } catch (error) {
    console.error('Error importing casinos to Railway:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importCasinosToRailway(); 