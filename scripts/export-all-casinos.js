const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportCasinos() {
  console.log('Exporting all casinos from database...');
  
  try {
    // Fetch all casinos with their bonuses
    const casinos = await prisma.casino.findMany({
      include: {
        bonuses: true
      },
      orderBy: {
        displayOrder: 'asc'
      }
    });
    
    console.log(`Found ${casinos.length} casinos to export`);
    
    // Transform the data for seeding
    const exportData = casinos.map(casino => {
      const { id, createdAt, updatedAt, bonuses, ...casinoData } = casino;
      
      return {
        ...casinoData,
        bonuses: bonuses.map(bonus => {
          const { id, casinoId, createdAt, updatedAt, ...bonusData } = bonus;
          return bonusData;
        })
      };
    });
    
    // Write to file
    const exportPath = path.join(__dirname, 'exported-casinos.json');
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    
    console.log(`Exported ${casinos.length} casinos to ${exportPath}`);
    console.log('You can now use this file to seed your production database');
    
  } catch (error) {
    console.error('Error exporting casinos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportCasinos(); 