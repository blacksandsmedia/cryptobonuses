const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Casinos where the founding year makes sense and should be kept
const KEEP_FOUNDING_YEARS = [
  'bitstarz.com',      // 2014 - established crypto casino
  '7bit-casino.com',   // 2014 - established crypto casino  
  'bitsler.com',       // 2015 - known crypto casino
  'roobet.com',        // 2016 - known crypto casino
  'gamdom.com',        // 2016 - known crypto casino
  'bcgame.com',        // 2018 - reasonable for BC Game
  'duelbits.com',      // 2020 - reasonable timing
  '1xbit1.com',        // 2018 - reasonable
  'fortunejack.com',   // 2014 - established crypto casino
  'primedice.com',     // 2013 - actually correct for Primedice
];

// Casinos that need manual research (clear founding year)
const CLEAR_FOR_MANUAL_RESEARCH = [
  'shufflecom.com',    // 1996 - way too early for crypto
  'stake.com',         // 1998 - Stake is much newer than this
  'coinplay.com',      // 1999 - way too early for crypto
  'flushcom.com',      // 2000 - too early
  'vave.com',          // 2003 - too early
  'coinpoker.com',     // 2004 - too early
  'jackbit.com',       // 2005 - too early
  'vavada.com',        // 2007 - too early
  'cloudbet.com',      // 2008 - Bitcoin wasn't even invented yet
  'betchain.com',      // 2009 - Bitcoin was just invented
  'betfury.com',       // 2009 - too early
  'rollbit.com',       // 2014 - probably too early for Rollbit
  'cryptoleo.com',     // 2017 - unclear, needs research
  'destinyx.com',      // 2017 - unclear, needs research
  'sirwin.com',        // 2018 - unclear, needs research
  'betiro.com',        // 2018 - unclear, needs research
  'crashino.com',      // 2021 - might be correct but verify
  'coinsgame.com',     // 2021 - might be correct but verify
  'metaspins.com',     // 2021 - might be correct but verify
  'spinarium.com',     // 2021 - might be correct but verify
];

async function cleanFoundingYears() {
  console.log('🧹 Cleaning up founding years...\n');
  
  let kept = 0;
  let cleared = 0;
  let notFound = 0;
  
  // Keep the reasonable ones
  console.log('✅ KEEPING (reasonable founding years):');
  for (const slug of KEEP_FOUNDING_YEARS) {
    try {
      const casino = await prisma.casino.findUnique({
        where: { slug },
        select: { name: true, foundedYear: true }
      });
      
      if (casino) {
        console.log(`  ${casino.name}: ${casino.foundedYear}`);
        kept++;
      } else {
        console.log(`  ⚠️  Casino not found: ${slug}`);
        notFound++;
      }
    } catch (error) {
      console.error(`  ❌ Error checking ${slug}: ${error.message}`);
    }
  }
  
  // Clear the questionable ones
  console.log('\n🗑️  CLEARING (needs manual research):');
  for (const slug of CLEAR_FOR_MANUAL_RESEARCH) {
    try {
      const casino = await prisma.casino.findUnique({
        where: { slug },
        select: { name: true, foundedYear: true }
      });
      
      if (casino) {
        if (casino.foundedYear) {
          await prisma.casino.update({
            where: { slug },
            data: { foundedYear: null }
          });
          console.log(`  ${casino.name}: Cleared ${casino.foundedYear} → null`);
          cleared++;
        } else {
          console.log(`  ${casino.name}: Already null`);
        }
      } else {
        console.log(`  ⚠️  Casino not found: ${slug}`);
        notFound++;
      }
    } catch (error) {
      console.error(`  ❌ Error clearing ${slug}: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 CLEANUP SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Kept: ${kept} casinos (reasonable founding years)`);
  console.log(`🗑️  Cleared: ${cleared} casinos (need manual research)`);
  if (notFound > 0) {
    console.log(`⚠️  Not found: ${notFound} casinos`);
  }
  
  console.log('\n📝 Next Steps:');
  console.log('1. Use the manual research template in scripts/manual-casino-research.md');
  console.log('2. Research the cleared casinos to find their actual founding dates');
  console.log('3. Update the database through the admin interface or API');
  
  // Show which casinos still need manual research
  const needsResearch = await prisma.casino.findMany({
    where: { foundedYear: null },
    select: { name: true, slug: true, website: true },
    orderBy: { name: 'asc' }
  });
  
  console.log(`\n🔍 CASINOS NEEDING MANUAL RESEARCH (${needsResearch.length} total):`);
  needsResearch.forEach(casino => {
    console.log(`  • ${casino.name} (${casino.website || 'no website'})`);
  });
}

cleanFoundingYears()
  .catch(console.error)
  .finally(() => process.exit()); 