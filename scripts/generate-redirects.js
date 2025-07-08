const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function generateRedirects() {
  // Check if we're in a build environment where database might not be available
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                     process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL;
  
  if (isBuildTime) {
    console.log('🏗️ Build environment detected, creating empty redirects config...');
    const emptyConfig = `// Empty redirects config for build time
// Generated on: ${new Date().toISOString()}
// Note: Database was not available during build

module.exports = {
  redirects: []
};`;
    
    const redirectsPath = path.join(process.cwd(), 'redirects.config.js');
    fs.writeFileSync(redirectsPath, emptyConfig);
    console.log('✅ Created empty redirects config for build process');
    return;
  }

  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Fetching redirects from database...');
    
    // Test database connection first
    await prisma.$connect();
    
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
    // IMPORTANT: Trailing slash versions come FIRST to take priority over Next.js normalization
    const nextjsRedirects = [];
    
    redirects.forEach(redirect => {
      // Trailing slash version FIRST (takes priority)
      nextjsRedirects.push({
        source: `/${redirect.oldSlug}/`,
        destination: `/${redirect.newSlug}`,
        permanent: true, // 301 redirect
        statusCode: 301  // Explicitly set 301 instead of 308
      });
      
      // Original redirect (without trailing slash) SECOND
      nextjsRedirects.push({
      source: `/${redirect.oldSlug}`,
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
    console.log('\n�� Sample redirects (trailing slash FIRST for priority):');
    redirects.slice(0, 3).forEach(redirect => {
      console.log(`   /${redirect.oldSlug}/ → /${redirect.newSlug}`);
      console.log(`   /${redirect.oldSlug} → /${redirect.newSlug}`);
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
    
    // Create empty redirects file as fallback
    console.log('🔄 Creating empty redirects config as fallback...');
    const fallbackConfig = `// Fallback empty redirects config
// Generated on: ${new Date().toISOString()}
// Note: Database connection failed during generation

module.exports = {
  redirects: []
};`;
    
    const redirectsPath = path.join(process.cwd(), 'redirects.config.js');
    fs.writeFileSync(redirectsPath, fallbackConfig);
    console.log('✅ Created fallback empty redirects config');
  } finally {
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.log('ℹ️  Database disconnect skipped (was not connected)');
    }
  }
}

// Run if called directly
if (require.main === module) {
  generateRedirects();
}

module.exports = { generateRedirects }; 