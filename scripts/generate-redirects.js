const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function generateRedirects() {
  try {
    console.log('🔍 Fetching redirects from database...');
    
    // Get all redirects from database
    const redirects = await prisma.slugRedirect.findMany({
      select: {
        oldSlug: true,
        newSlug: true,
        entityType: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`📊 Found ${redirects.length} redirects in database`);

    if (redirects.length === 0) {
      console.log('⚠️  No redirects found in database');
      return;
    }

    // Generate Next.js redirects configuration
    const nextjsRedirects = redirects.map(redirect => ({
      source: `/${redirect.oldSlug}`,
      destination: `/${redirect.newSlug}`,
      permanent: true // 301 redirect
    }));

    // Create the configuration content
    const configContent = `// Auto-generated redirects from database
// Generated on: ${new Date().toISOString()}
// Total redirects: ${redirects.length}

module.exports = {
  redirects: ${JSON.stringify(nextjsRedirects, null, 2)}
};`;

    // Write to redirects config file
    const redirectsPath = path.join(process.cwd(), 'redirects.config.js');
    fs.writeFileSync(redirectsPath, configContent);

    console.log('✅ Generated redirects configuration:');
    console.log(`📁 File: ${redirectsPath}`);
    console.log(`📈 Redirects: ${redirects.length}`);
    
    // Show sample redirects
    console.log('\n📋 Sample redirects:');
    redirects.slice(0, 5).forEach(redirect => {
      console.log(`   /${redirect.oldSlug} → /${redirect.newSlug}`);
    });

    if (redirects.length > 5) {
      console.log(`   ... and ${redirects.length - 5} more`);
    }

    console.log('\n📚 Next steps:');
    console.log('1. Import this config in your next.config.js:');
    console.log('   const redirectsConfig = require("./redirects.config.js");');
    console.log('2. Add to your Next.js config:');
    console.log('   async redirects() { return redirectsConfig.redirects; }');
    console.log('3. Rebuild and deploy your application');

  } catch (error) {
    console.error('❌ Error generating redirects:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  generateRedirects();
}

module.exports = { generateRedirects }; 