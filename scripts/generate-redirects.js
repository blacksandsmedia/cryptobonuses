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
    // Create both regular and trailing slash versions for each redirect
    const nextjsRedirects = [];
    
    redirects.forEach(redirect => {
      // Original redirect (without trailing slash)
      nextjsRedirects.push({
        source: `/${redirect.oldSlug}`,
        destination: `/${redirect.newSlug}`,
        permanent: true, // 301 redirect
        statusCode: 301  // Explicitly set 301 instead of 308
      });
      
      // Trailing slash version
      nextjsRedirects.push({
        source: `/${redirect.oldSlug}/`,
        destination: `/${redirect.newSlug}`,
        permanent: true, // 301 redirect
        statusCode: 301  // Explicitly set 301 instead of 308
      });
    });

    // Create the configuration content
    const configContent = `// Auto-generated redirects from database
// Generated on: ${new Date().toISOString()}
// Database entries: ${redirects.length}
// Total redirects: ${nextjsRedirects.length} (includes trailing slash versions)

module.exports = {
  redirects: ${JSON.stringify(nextjsRedirects, null, 2)}
};`;

    // Write to redirects config file
    const redirectsPath = path.join(process.cwd(), 'redirects.config.js');
    fs.writeFileSync(redirectsPath, configContent);

    console.log('✅ Generated redirects configuration:');
    console.log(`📁 File: ${redirectsPath}`);
    console.log(`📊 Database entries: ${redirects.length}`);
    console.log(`📈 Total redirects: ${nextjsRedirects.length} (with trailing slash versions)`);
    
    // Show sample redirects
    console.log('\n📋 Sample redirects (showing both versions):');
    redirects.slice(0, 3).forEach(redirect => {
      console.log(`   /${redirect.oldSlug} → /${redirect.newSlug}`);
      console.log(`   /${redirect.oldSlug}/ → /${redirect.newSlug}`);
    });

    if (redirects.length > 3) {
      console.log(`   ... and ${(redirects.length - 3) * 2} more redirects`);
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