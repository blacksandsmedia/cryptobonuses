const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateSlugsToNewFormat() {
  try {
    console.log('Starting casino slug migration to domain format...\n');

    // Get all casinos
    const casinos = await prisma.casino.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        website: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`Found ${casinos.length} casinos to migrate\n`);

    const migrationResults = {
      updated: 0,
      skipped: 0,
      errors: 0,
      redirectsCreated: 0
    };

    for (const casino of casinos) {
      try {
        const oldSlug = casino.slug;
        let newSlug;

        // Handle different cases for generating new slugs
        if (oldSlug.includes('.')) {
          // If slug already contains a dot, skip or handle differently
          console.log(`⚠️  Skipping ${casino.name} (${oldSlug}) - already contains domain`);
          migrationResults.skipped++;
          continue;
        } else {
          // Add .com to the slug
          newSlug = `${oldSlug}.com`;
        }

        console.log(`🔄 Migrating ${casino.name}:`);
        console.log(`   Old slug: ${oldSlug}`);
        console.log(`   New slug: ${newSlug}`);

        // Check if new slug already exists
        const existingCasino = await prisma.casino.findUnique({
          where: { slug: newSlug }
        });

        if (existingCasino) {
          console.log(`❌ Conflict: ${newSlug} already exists for ${existingCasino.name}`);
          migrationResults.errors++;
          continue;
        }

        // Update the casino slug
        await prisma.casino.update({
          where: { id: casino.id },
          data: { slug: newSlug }
        });

        // Create redirect entry for SEO
        await prisma.slugRedirect.create({
          data: {
            oldSlug: oldSlug,
            newSlug: newSlug,
            entityType: 'casino'
          }
        });

        console.log(`✅ Successfully migrated ${casino.name}`);
        migrationResults.updated++;
        migrationResults.redirectsCreated++;

      } catch (error) {
        console.error(`❌ Error migrating ${casino.name}:`, error.message);
        migrationResults.errors++;
      }

      console.log(''); // Empty line for readability
    }

    // Summary
    console.log('Migration Summary:');
    console.log('=================');
    console.log(`✅ Updated: ${migrationResults.updated} casinos`);
    console.log(`⚠️  Skipped: ${migrationResults.skipped} casinos`);
    console.log(`❌ Errors: ${migrationResults.errors} casinos`);
    console.log(`🔗 Redirects created: ${migrationResults.redirectsCreated}`);
    console.log('');

    if (migrationResults.updated > 0) {
      console.log('🎉 Migration completed successfully!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Clear Next.js cache and restart the development server');
      console.log('2. Update any hardcoded slug references in the codebase');
      console.log('3. Test that old URLs redirect properly to new ones');
    }

  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  migrateSlugsToNewFormat();
}

module.exports = { migrateSlugsToNewFormat }; 