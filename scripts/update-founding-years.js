const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateFoundingYears(filename) {
  if (!filename) {
    console.error('❌ Please provide a research results file');
    console.log('Usage: node scripts/update-founding-years.js <research-file.json>');
    process.exit(1);
  }

  if (!fs.existsSync(filename)) {
    console.error(`❌ File not found: ${filename}`);
    process.exit(1);
  }

  try {
    const results = JSON.parse(fs.readFileSync(filename, 'utf8'));
    
    console.log('🔄 Updating casino founding years in database...\n');
    
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const result of results) {
      if (!result.year || result.method === 'existing') {
        console.log(`⏭️  ${result.casino}: Skipping (${result.method || 'no year found'})`);
        skipped++;
        continue;
      }
      
      try {
        await prisma.casino.update({
          where: { slug: result.slug },
          data: { foundedYear: result.year }
        });
        
        console.log(`✅ ${result.casino}: Updated to ${result.year} (${result.method})`);
        updated++;
        
      } catch (error) {
        console.error(`❌ ${result.casino}: Failed to update - ${error.message}`);
        errors++;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 UPDATE SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Updated: ${updated} casinos`);
    console.log(`⏭️  Skipped: ${skipped} casinos`);
    console.log(`❌ Errors: ${errors} casinos`);
    
    if (updated > 0) {
      console.log('\n🎉 Database successfully updated with founding years!');
    }
    
  } catch (error) {
    console.error('❌ Error reading or processing file:', error.message);
    process.exit(1);
  }
}

// Get filename from command line arguments
const filename = process.argv[2];
updateFoundingYears(filename)
  .catch(console.error)
  .finally(() => process.exit()); 