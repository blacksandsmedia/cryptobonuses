const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importCasinos() {
  console.log('Importing all casinos to database...');
  
  try {
    // Read the exported data
    const exportPath = path.join(__dirname, 'exported-casinos.json');
    if (!fs.existsSync(exportPath)) {
      throw new Error('exported-casinos.json not found. Please run export-all-casinos.js first.');
    }
    
    const casinos = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
    console.log(`Found ${casinos.length} casinos to import`);
    
    // Clear existing casinos (optional - remove this if you want to keep existing data)
    console.log('Clearing existing casinos...');
    await prisma.bonus.deleteMany({});
    await prisma.casino.deleteMany({});
    
    // Import each casino and its bonuses
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
    }
    
    console.log(`Successfully imported ${casinos.length} casinos!`);
    
  } catch (error) {
    console.error('Error importing casinos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importCasinos(); 