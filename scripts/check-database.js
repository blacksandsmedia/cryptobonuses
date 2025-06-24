const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('Checking database contents...\n');
  
  try {
    // Check casinos
    const casinoCount = await prisma.casino.count();
    console.log(`🎰 Casinos: ${casinoCount}`);
    
    if (casinoCount > 0) {
      const casinos = await prisma.casino.findMany({
        take: 5,
        select: { name: true, slug: true }
      });
      console.log('First 5 casinos:');
      casinos.forEach(c => console.log(`  - ${c.name} (${c.slug})`));
    }
    
    // Check bonuses
    const bonusCount = await prisma.bonus.count();
    console.log(`\n🎁 Bonuses: ${bonusCount}`);
    
    // Check legal pages
    const legalPageCount = await prisma.legalPage.count();
    console.log(`\n📄 Legal Pages: ${legalPageCount}`);
    
    if (legalPageCount > 0) {
      const legalPages = await prisma.legalPage.findMany({
        select: { title: true, slug: true }
      });
      console.log('Legal pages:');
      legalPages.forEach(p => console.log(`  - ${p.title} (/${p.slug})`));
    }
    
    // Check reports
    const reportCount = await prisma.casinoReport.count();
    console.log(`\n📋 Casino Reports: ${reportCount}`);
    
    console.log('\n✅ Database check complete!');
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase(); 