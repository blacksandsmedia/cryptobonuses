const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Static recommendations mapping from the frontend
const CASINO_RECOMMENDATIONS = {
  '0x.bet': ['vavada.com', 'bitsler.com', 'livecasino.io'],
  '1xbit1.com': ['leebet.io', 'trustdice.win', 'bitsler.com'],
  '7bitcasino.com': ['stake.com', 'coinplay.com', 'crypto-games.io'],
  'bc.game': ['coins.game', 'stake.us', 'primedice.com'],
  'betchain.com': ['oshi.io', 'coinpoker.com', 'tether.bet'],
  'betfury.com': ['justbit.io', 'betchain.com', 'chips.gg'],
  'betiro.com': ['gamdom.com', 'stake.us', 'bitstarz.com'],
  'betpanda.io': ['0x.bet', 'bets.io', 'rollbit.com'],
  'betplay.io': ['cryptoleo.com', 'betpanda.io', 'gamdom.com'],
  'bets.io': ['bitcasino.io', 'coinplay.com', 'tether.bet'],
  'bitcasino.io': ['nanogames.io', 'betfury.com', 'destinyx.com'],
  'bitsler.com': ['betchain.com', 'jacksclub.io', '7bitcasino.com'],
  'bitstarz.com': ['winz.io', 'betpanda.io', 'coins.game'],
  'bovada.lv': ['sirwin.com', '1xbit1.com', 'mbitcasino.io'],
  'bspin.io': ['empire.io', 'crashino.com/en', 'bitstarz.com'],
  'chips.gg': ['flush.com', 'stake.com', 'betiro.com'],
  'cloudbet.com': ['nanogames.io', 'fortunejack.com', '1xbit1.com'],
  'coinplay.com': ['pixel.gg', 'sirwin.com', 'primedice.com'],
  'coinpoker.com': ['duelbits.com', 'cloudbet.com', 'coins.game'],
  'coins.game': ['bovada.lv', '0x.bet', 'crypto-games.io'],
  'crashino.com/en': ['bitstarz.com', 'sportsbet.io', 'wild.io'],
  'crypto-games.io': ['bc.game', 'trustdice.win', 'rollbit.com'],
  'cryptoleo.com': ['livecasino.io', 'crashino.com/en', 'stake.us'],
  'destinyx.com': ['flush.com', 'fairspin.io', 'luckybird.io'],
  'duelbits.com': ['mbitcasino.io', 'roobet.com', 'sportsbet.io'],
  'empire.io': ['crashino.com/en', 'betfury.com', 'ignitioncasino.eu'],
  'fairspin.io': ['betplay.io', '1xbit1.com', 'spinarium.com'],
  'flush.com': ['jacksclub.io', 'bspin.io', 'fortunejack.com'],
  'fortunejack.com': ['vavada.com', 'winz.io', 'bspin.io'],
  'gamdom.com': ['oshi.io', 'tether.bet', 'thunderpick.io'],
  'ignitioncasino.eu': ['jackbit.com', 'betiro.com', 'sportsbet.io'],
  'jackbit.com': ['bovada.lv', 'pixel.gg', 'spinarium.com'],
  'jacksclub.io': ['rollbit.com', 'crypto-games.io', 'bovada.lv'],
  'justbit.io': ['bc.game', 'duelbits.com', 'oshi.io'],
  'leebet.io': ['spinarium.com', 'jackbit.com', 'stake.com'],
  'livecasino.io': ['cryptoleo.com', 'justbit.io', 'empire.io'],
  'luckybird.io': ['vave.com', 'destinyx.com', 'shuffle.com'],
  'mbitcasino.io': ['duelbits.com', 'chips.gg', 'vave.com'],
  'metaspins.com': ['shuffle.com', 'betpanda.io', 'betchain.com'],
  'nanogames.io': ['trustdice.win', 'ignitioncasino.eu', 'metaspins.com'],
  'oshi.io': ['coinplay.com', 'justbit.io', 'roobet.com'],
  'pixel.gg': ['jackbit.com', 'metaspins.com', 'luckybird.io'],
  'primedice.com': ['pixel.gg', 'fairspin.io', 'metaspins.com'],
  'rollbit.com': ['bitsler.com', 'wild.io', 'thunderpick.io'],
  'roobet.com': ['thunderpick.io', 'fairspin.io', 'sirwin.com'],
  'shuffle.com': ['leebet.io', 'primedice.com', 'livecasino.io'],
  'sirwin.com': ['cloudbet.com', 'mbitcasino.io', 'coinpoker.com'],
  'spinarium.com': ['betplay.io', 'betiro.com', 'bitcasino.io'],
  'sportsbet.io': ['coinpoker.com', 'bitcasino.io', 'wild.io'],
  'stake.com': ['7bitcasino.com', 'bets.io', 'vavada.com'],
  'stake.us': ['bets.io', 'shuffle.com', 'leebet.io'],
  'tether.bet': ['chips.gg', 'flush.com', 'bspin.io'],
  'thunderpick.io': ['betplay.io', 'gamdom.com', '0x.bet'],
  'trustdice.win': ['destinyx.com', 'vave.com', 'winz.io'],
  'vavada.com': ['ignitioncasino.eu', 'cloudbet.com', 'empire.io'],
  'vave.com': ['7bitcasino.com', 'fortunejack.com', 'nanogames.io'],
  'wild.io': ['jacksclub.io', 'roobet.com', 'luckybird.io'],
  'winz.io': ['cryptoleo.com', 'betfury.com', 'bc.game'],
};

async function migrateRecommendations() {
  console.log('🔄 Starting migration of static casino recommendations to database...');
  
  try {
    // Get all casinos to create a slug-to-ID mapping
    const allCasinos = await prisma.casino.findMany({
      select: { id: true, slug: true, name: true }
    });
    
    const slugToIdMap = {};
    allCasinos.forEach(casino => {
      slugToIdMap[casino.slug] = casino.id;
    });
    
    console.log(`📋 Found ${allCasinos.length} casinos in database`);
    console.log(`📋 Processing ${Object.keys(CASINO_RECOMMENDATIONS).length} recommendation mappings`);
    
    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Process each casino's recommendations
    for (const [casinoSlug, recommendedSlugs] of Object.entries(CASINO_RECOMMENDATIONS)) {
      const casinoId = slugToIdMap[casinoSlug];
      
      if (!casinoId) {
        console.warn(`⚠️  Casino not found: ${casinoSlug}`);
        skippedCount++;
        continue;
      }
      
      // Convert recommended slugs to IDs
      const recommendedIds = [];
      for (const slug of recommendedSlugs) {
        const recommendedId = slugToIdMap[slug];
        if (recommendedId) {
          recommendedIds.push(recommendedId);
        } else {
          console.warn(`⚠️  Recommended casino not found: ${slug} (for ${casinoSlug})`);
        }
      }
      
      if (recommendedIds.length === 0) {
        console.warn(`⚠️  No valid recommendations found for ${casinoSlug}`);
        skippedCount++;
        continue;
      }
      
      try {
        // Update the casino with recommended casino IDs
        await prisma.casino.update({
          where: { id: casinoId },
          data: { recommendedCasinoIds: recommendedIds }
        });
        
        console.log(`✅ Updated ${casinoSlug} with ${recommendedIds.length} recommendations`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error updating ${casinoSlug}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successfully migrated: ${successCount} casinos`);
    console.log(`⚠️  Skipped: ${skippedCount} casinos`);
    console.log(`❌ Errors: ${errorCount} casinos`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Migration completed successfully!');
    } else {
      console.log('\n⚠️  Migration completed with some errors. Check the logs above.');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateRecommendations().catch(console.error); 