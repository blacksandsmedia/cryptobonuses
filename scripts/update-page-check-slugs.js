const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updatePageCheckSlugs() {
  try {
    console.log('Starting Page Check slug migration...\n');

    // Get all page checks with their current slugs
    const pageChecks = await prisma.pageCheck.findMany({
      select: {
        id: true,
        pageSlug: true,
      }
    });

    console.log(`Found ${pageChecks.length} page checks to review\n`);

    const updateResults = {
      updated: 0,
      skipped: 0,
      errors: 0
    };

    for (const pageCheck of pageChecks) {
      try {
        const oldSlug = pageCheck.pageSlug;
        
        // Skip if slug already contains .com
        if (oldSlug.includes('.com')) {
          updateResults.skipped++;
          continue;
        }

        const newSlug = `${oldSlug}.com`;

        console.log(`🔄 Updating Page Check ${pageCheck.id}:`);
        console.log(`   Old slug: ${oldSlug}`);
        console.log(`   New slug: ${newSlug}`);

        // Update the page check slug
        await prisma.pageCheck.update({
          where: { id: pageCheck.id },
          data: { pageSlug: newSlug }
        });

        console.log(`✅ Successfully updated Page Check ${pageCheck.id}\n`);
        updateResults.updated++;

      } catch (error) {
        console.error(`❌ Error updating Page Check ${pageCheck.id}:`, error.message);
        updateResults.errors++;
      }
    }

    // Summary
    console.log('Page Check Migration Summary:');
    console.log('=============================');
    console.log(`✅ Updated: ${updateResults.updated} page checks`);
    console.log(`⚠️  Skipped: ${updateResults.skipped} page checks (already .com format)`);
    console.log(`❌ Errors: ${updateResults.errors} page checks`);
    console.log('');

    if (updateResults.updated > 0) {
      console.log('🎉 Page Check migration completed successfully!');
    } else {
      console.log('ℹ️  No page checks needed updating.');
    }

  } catch (error) {
    console.error('Error during page check migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  updatePageCheckSlugs();
}

module.exports = { updatePageCheckSlugs }; 