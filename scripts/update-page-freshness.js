const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updatePageFreshness() {
  try {
    console.log('🔄 Updating page freshness for SEO...');
    
    // Update lastModified for all legal pages
    const updateResult = await prisma.legalPage.updateMany({
      data: {
        lastModified: new Date()
      }
    });

    console.log(`✅ Updated lastModified for ${updateResult.count} legal pages`);
    console.log(`🕒 Updated at: ${new Date().toISOString()}`);
    
    // Log which pages were updated
    const allPages = await prisma.legalPage.findMany({
      select: { slug: true, title: true, lastModified: true }
    });
    
    console.log('\n📄 Updated pages:');
    allPages.forEach(page => {
      console.log(`  - ${page.title} (/${page.slug})`);
    });
    
    console.log('\n💡 This will help search engines see fresh content on legal pages!');
    
  } catch (error) {
    console.error('❌ Error updating page freshness:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Check if script is being run directly
if (require.main === module) {
  updatePageFreshness();
}

module.exports = { updatePageFreshness }; 