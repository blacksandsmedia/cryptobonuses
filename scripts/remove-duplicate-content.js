const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Helper function to create a hash of content (ignoring casino name differences)
function createContentHash(content) {
  if (!content) return null;
  
  // Remove casino names and common variables to detect template duplicates
  const normalizedContent = content
    .replace(/\b[A-Z][a-zA-Z\s]{2,15}(?:\s(?:Casino|Gaming|Bet))?\b/g, '{{CASINO_NAME}}') // Replace casino names
    .replace(/\$[\d,]+/g, '{{AMOUNT}}') // Replace dollar amounts
    .replace(/\d+\s*BTC/g, '{{BTC_AMOUNT}}') // Replace BTC amounts
    .replace(/over\s+\d+[,\d]*\s+games/g, 'over {{NUMBER}} games') // Replace game counts
    .replace(/\d{4}/g, '{{YEAR}}') // Replace years
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .toLowerCase();
    
  return crypto.createHash('md5').update(normalizedContent).digest('hex');
}

// Find casinos with duplicate content in each section
async function findDuplicateContent() {
  console.log('🔍 Analyzing casino content for duplicates...\n');
  
  const casinos = await prisma.casino.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      aboutContent: true,
      howToRedeemContent: true,
      bonusDetailsContent: true,
      gameContent: true,
      termsContent: true,
      faqContent: true
    }
  });
  
  console.log(`Found ${casinos.length} casinos to analyze\n`);
  
  const sections = [
    'aboutContent',
    'howToRedeemContent', 
    'bonusDetailsContent',
    'gameContent',
    'termsContent',
    'faqContent'
  ];
  
  const duplicateReport = {};
  
  for (const section of sections) {
    console.log(`📋 Analyzing ${section}...`);
    const contentMap = new Map();
    
    for (const casino of casinos) {
      const content = casino[section];
      if (!content) continue;
      
      const hash = createContentHash(content);
      if (!contentMap.has(hash)) {
        contentMap.set(hash, []);
      }
      contentMap.get(hash).push({
        id: casino.id,
        name: casino.name,
        slug: casino.slug,
        contentLength: content.length
      });
    }
    
    // Find duplicates (groups with more than 1 casino)
    const duplicates = Array.from(contentMap.values()).filter(group => group.length > 1);
    
    if (duplicates.length > 0) {
      console.log(`   ❌ Found ${duplicates.length} duplicate content groups`);
      duplicates.forEach((group, index) => {
        console.log(`      Group ${index + 1}: ${group.map(c => c.name).join(', ')}`);
      });
      duplicateReport[section] = duplicates;
    } else {
      console.log(`   ✅ No duplicates found`);
      duplicateReport[section] = [];
    }
    console.log('');
  }
  
  return duplicateReport;
}

// Remove duplicate content by clearing it from all but one casino in each group
async function removeDuplicateContent(duplicateReport) {
  console.log('🧹 Removing duplicate content...\n');
  
  let totalCleared = 0;
  
  for (const [section, duplicateGroups] of Object.entries(duplicateReport)) {
    if (duplicateGroups.length === 0) continue;
    
    console.log(`📝 Processing ${section}...`);
    
    for (const group of duplicateGroups) {
      if (group.length <= 1) continue;
      
      // Keep the first casino in the group, clear the rest
      const [keepCasino, ...clearCasinos] = group;
      
      console.log(`   ✅ Keeping content in: ${keepCasino.name}`);
      console.log(`   🗑️  Clearing content from: ${clearCasinos.map(c => c.name).join(', ')}`);
      
      // Clear content from duplicate casinos
      for (const casino of clearCasinos) {
        await prisma.casino.update({
          where: { id: casino.id },
          data: { [section]: null }
        });
        totalCleared++;
      }
    }
    console.log('');
  }
  
  console.log(`✅ Cleared duplicate content from ${totalCleared} casino sections`);
}

// Special handling for very common template content that should be removed entirely
async function removeGenericTemplateContent() {
  console.log('🎯 Removing generic template content...\n');
  
  const casinos = await prisma.casino.findMany({
    select: {
      id: true,
      name: true,
      gameContent: true
    }
  });
  
  let templateContentRemoved = 0;
  
  // Check for the specific game content template that appears to be identical across casinos
  const gameContentTemplate = /offers an impressive selection of over 3,000 games.*Slot Games.*Table Games.*Crypto-Native Games.*Live Dealer Games/s;
  
  for (const casino of casinos) {
    if (casino.gameContent && gameContentTemplate.test(casino.gameContent)) {
      await prisma.casino.update({
        where: { id: casino.id },
        data: { gameContent: null }
      });
      console.log(`   🗑️  Cleared generic game template from: ${casino.name}`);
      templateContentRemoved++;
    }
  }
  
  console.log(`✅ Removed generic template content from ${templateContentRemoved} casinos\n`);
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting duplicate content removal process...\n');
    
    // First, remove obvious generic template content
    await removeGenericTemplateContent();
    
    // Then find and remove duplicate content
    const duplicateReport = await findDuplicateContent();
    await removeDuplicateContent(duplicateReport);
    
    // Generate summary report
    console.log('📊 SUMMARY REPORT');
    console.log('='.repeat(50));
    
    let totalDuplicateGroups = 0;
    for (const [section, groups] of Object.entries(duplicateReport)) {
      totalDuplicateGroups += groups.length;
      if (groups.length > 0) {
        console.log(`${section}: ${groups.length} duplicate groups found and processed`);
      }
    }
    
    if (totalDuplicateGroups === 0) {
      console.log('✅ No duplicate content found - all casino pages have unique content!');
    } else {
      console.log(`\n🎯 Processed ${totalDuplicateGroups} duplicate content groups across all sections`);
      console.log('💡 Recommendation: Add unique, casino-specific content to the cleared sections');
    }
    
    console.log('\n✅ Duplicate content removal completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during duplicate content removal:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main(); 