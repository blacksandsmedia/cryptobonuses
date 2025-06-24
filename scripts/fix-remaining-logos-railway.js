const { PrismaClient } = require('@prisma/client');

// Railway database URL
const RAILWAY_DATABASE_URL = "postgresql://postgres:sfMJppsPfMKvFQUYOuWWgIvXdvoGwkCV@crossover.proxy.rlwy.net:51878/railway";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: RAILWAY_DATABASE_URL
    }
  }
});

// Manual mapping for the remaining 3 casinos
const manualMappings = {
  'CryptoGames': '/images/Crypto-Games Logo.png',
  'Empire.io': '/images/EmpireCasino Logo.png',
  'Flush.com': '/images/FlushCasino Logo.png'
};

async function fixRemainingLogos() {
  console.log('Fixing remaining 3 casino logos in Railway database...');

  try {
    await prisma.$connect();
    console.log('✓ Connected to Railway database');

    for (const [casinoName, logoPath] of Object.entries(manualMappings)) {
      const casino = await prisma.casino.findFirst({
        where: {
          name: {
            contains: casinoName,
            mode: 'insensitive'
          }
        }
      });

      if (casino) {
        await prisma.casino.update({
          where: { id: casino.id },
          data: { logo: logoPath }
        });
        console.log(`✓ Updated ${casino.name}: ${logoPath}`);
      } else {
        console.log(`❌ Casino not found: ${casinoName}`);
      }
    }

    console.log('✓ All remaining logos fixed!');

  } catch (error) {
    console.error('❌ Error fixing remaining logos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('✓ Database connection closed');
  }
}

fixRemainingLogos()
  .catch((e) => {
    console.error('Failed to fix remaining logos:', e);
    process.exit(1);
  }); 