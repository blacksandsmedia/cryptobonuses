const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifySlugMigration() {
  try {
    console.log('Verifying slug migration...\n');

    // Check casinos
    const casinos = await prisma.casino.findMany({
      select: {
        name: true,
        slug: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log('Casino Slugs After Migration:');
    console.log('=============================');
    
    let casinosWithoutDomain = 0;
    let casinosWithDomain = 0;
    
    casinos.forEach((casino, index) => {
      if (casino.slug.includes('.com')) {
        casinosWithDomain++;
        console.log(`✅ ${index + 1}. ${casino.name} -> ${casino.slug}`);
      } else {
        casinosWithoutDomain++;
        console.log(`❌ ${index + 1}. ${casino.name} -> ${casino.slug} (MISSING .com)`);
      }
    });

    console.log(`\nCasino Summary:`);
    console.log(`✅ With .com domain: ${casinosWithDomain}`);
    console.log(`❌ Without domain: ${casinosWithoutDomain}`);
    console.log(`📊 Total casinos: ${casinos.length}\n`);

    // Check redirects
    const redirects = await prisma.slugRedirect.findMany({
      where: {
        entityType: 'casino'
      },
      select: {
        oldSlug: true,
        newSlug: true,
      }
    });

    console.log(`Redirect Entries: ${redirects.length}`);
    if (redirects.length > 0) {
      console.log('Sample redirects:');
      redirects.slice(0, 5).forEach(redirect => {
        console.log(`  ${redirect.oldSlug} -> ${redirect.newSlug}`);
      });
      if (redirects.length > 5) {
        console.log(`  ... and ${redirects.length - 5} more`);
      }
    }
    console.log('');

    // Check page checks
    const pageChecks = await prisma.pageCheck.findMany({
      select: {
        pageSlug: true,
      }
    });

    let pageChecksWithDomain = 0;
    let pageChecksWithoutDomain = 0;

    pageChecks.forEach(check => {
      if (check.pageSlug.includes('.com')) {
        pageChecksWithDomain++;
      } else {
        pageChecksWithoutDomain++;
      }
    });

    console.log(`Page Check Summary:`);
    console.log(`✅ With .com domain: ${pageChecksWithDomain}`);
    console.log(`❌ Without domain: ${pageChecksWithoutDomain}`);
    console.log(`📊 Total page checks: ${pageChecks.length}\n`);

    // Overall status
    const migrationSuccess = casinosWithoutDomain === 0 && pageChecksWithoutDomain === 0;
    
    if (migrationSuccess) {
      console.log('🎉 Migration verification PASSED!');
      console.log('All casinos and page checks are using the new .com format.');
    } else {
      console.log('⚠️  Migration verification found issues:');
      if (casinosWithoutDomain > 0) {
        console.log(`- ${casinosWithoutDomain} casinos still using old format`);
      }
      if (pageChecksWithoutDomain > 0) {
        console.log(`- ${pageChecksWithoutDomain} page checks still using old format`);
      }
    }

    console.log('\nNext steps:');
    console.log('1. Test that old URLs redirect to new ones (e.g., /bitstarz -> /bitstarz.com)');
    console.log('2. Update any hardcoded references in the codebase');
    console.log('3. Test casino pages load correctly with new URLs');

  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  verifySlugMigration();
}

module.exports = { verifySlugMigration }; 