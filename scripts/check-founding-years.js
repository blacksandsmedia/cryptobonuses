const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFoundingYears() {
  const casinos = await prisma.casino.findMany({
    where: { foundedYear: { not: null } },
    select: { name: true, slug: true, website: true, foundedYear: true },
    orderBy: { foundedYear: 'asc' }
  });
  
  console.log('Current Founded Years:');
  console.log('=====================');
  casinos.forEach(casino => {
    console.log(`${casino.foundedYear}: ${casino.name} (${casino.website || 'no website'})`);
  });
  
  console.log(`\nTotal: ${casinos.length} casinos with founded years`);
}

checkFoundingYears()
  .catch(console.error)
  .finally(() => process.exit()); 