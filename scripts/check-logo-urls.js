const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkLogoUrls() {
  try {
    console.log('Checking casino logo URLs in database...\n');
    
    const casinos = await prisma.casino.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        displayOrder: true
      },
      orderBy: {
        displayOrder: 'asc'
      }
    });

    console.log(`Found ${casinos.length} casinos in database:\n`);
    
    casinos.forEach((casino, index) => {
      console.log(`${index + 1}. ${casino.name}`);
      console.log(`   Slug: ${casino.slug}`);
      console.log(`   Logo URL: "${casino.logo || 'NULL/EMPTY'}"`);
      console.log(`   Display Order: ${casino.displayOrder}`);
      console.log('');
    });

    // Check if any casinos have empty or null logos
    const emptyLogos = casinos.filter(casino => !casino.logo || casino.logo.trim() === '');
    console.log(`\nCasinos with empty/null logos: ${emptyLogos.length}`);
    if (emptyLogos.length > 0) {
      emptyLogos.forEach(casino => {
        console.log(`- ${casino.name} (${casino.slug})`);
      });
    }

    // Check logo patterns
    const logoPatterns = {};
    casinos.forEach(casino => {
      if (casino.logo) {
        const pattern = casino.logo.startsWith('/') ? 'Absolute path' : 'Relative path';
        logoPatterns[pattern] = (logoPatterns[pattern] || 0) + 1;
      }
    });

    console.log('\nLogo URL patterns:');
    Object.entries(logoPatterns).forEach(([pattern, count]) => {
      console.log(`- ${pattern}: ${count} casinos`);
    });

  } catch (error) {
    console.error('Error checking logo URLs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLogoUrls(); 