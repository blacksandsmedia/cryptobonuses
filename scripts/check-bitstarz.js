const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBitstarz() {
  const casino = await prisma.casino.findUnique({
    where: { slug: 'bitstarz.com' },
    select: { name: true, slug: true, foundedYear: true }
  });
  
  console.log('Bitstarz data:', casino);
  
  // Also check if there are any other slug variations
  const allBitstarz = await prisma.casino.findMany({
    where: { 
      OR: [
        { slug: { contains: 'bitstarz' } },
        { name: { contains: 'Bitstarz' } }
      ]
    },
    select: { name: true, slug: true, foundedYear: true }
  });
  
  console.log('All Bitstarz variations:', allBitstarz);
}

checkBitstarz()
  .catch(console.error)
  .finally(() => process.exit()); 