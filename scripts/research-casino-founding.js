const puppeteer = require('puppeteer');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Common patterns to look for on casino websites
const FOUNDING_PATTERNS = [
  /established\s+in\s+(\d{4})/i,
  /founded\s+in\s+(\d{4})/i,
  /since\s+(\d{4})/i,
  /operating\s+since\s+(\d{4})/i,
  /launched\s+in\s+(\d{4})/i,
  /started\s+in\s+(\d{4})/i,
  /©\s*(\d{4})/,  // Copyright dates as fallback
];

// Function to extract founding year from text
function extractFoundingYear(text) {
  for (const pattern of FOUNDING_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const year = parseInt(match[1]);
      const currentYear = new Date().getFullYear();
      
      // Validate year is reasonable (between 1990 and current year)
      if (year >= 1990 && year <= currentYear) {
        return year;
      }
    }
  }
  return null;
}

// Function to scrape a casino's website for founding information
async function scrapeCasinoFounding(browser, casino) {
  if (!casino.website) {
    console.log(`❌ ${casino.name}: No website URL`);
    return { casino: casino.name, year: null, method: 'no_website', notes: 'No website URL available' };
  }

  try {
    console.log(`🔍 Researching ${casino.name} (${casino.website})...`);
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    // Go to the main website
    await page.goto(casino.website, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Get all text content from the page
    const pageText = await page.evaluate(() => document.body.innerText);
    
    // Look for founding year in main page
    let foundingYear = extractFoundingYear(pageText);
    let method = 'homepage';
    let notes = '';
    
    // If not found on homepage, try about page
    if (!foundingYear) {
      try {
        // Look for about/company links
        const aboutLinks = await page.$$eval('a', links => 
          links.filter(link => 
            /about|company|history|story/i.test(link.textContent) ||
            /about|company|history|story/i.test(link.href)
          ).map(link => link.href)
        );
        
        if (aboutLinks.length > 0) {
          console.log(`  📖 Checking about page: ${aboutLinks[0]}`);
          await page.goto(aboutLinks[0], { waitUntil: 'networkidle0', timeout: 15000 });
          const aboutText = await page.evaluate(() => document.body.innerText);
          foundingYear = extractFoundingYear(aboutText);
          method = 'about_page';
        }
      } catch (error) {
        console.log(`  ⚠️  Failed to check about page: ${error.message}`);
      }
    }
    
    // Look for license information as backup
    if (!foundingYear) {
      const licenseText = pageText.toLowerCase();
      if (licenseText.includes('license') || licenseText.includes('licence')) {
        // Look for license numbers with years
        const licenseMatch = pageText.match(/license[d]?\s*[#:]?\s*[a-z0-9]*[-/]?(\d{4})/i);
        if (licenseMatch) {
          const year = parseInt(licenseMatch[1]);
          if (year >= 1990 && year <= new Date().getFullYear()) {
            foundingYear = year;
            method = 'license_info';
            notes = 'Based on license information';
          }
        }
      }
    }
    
    await page.close();
    
    if (foundingYear) {
      console.log(`  ✅ Found founding year: ${foundingYear} (via ${method})`);
    } else {
      console.log(`  ❌ No founding year found`);
      notes = 'No founding information found on website';
    }
    
    return {
      casino: casino.name,
      slug: casino.slug,
      website: casino.website,
      year: foundingYear,
      method,
      notes
    };
    
  } catch (error) {
    console.log(`  ❌ Error scraping ${casino.name}: ${error.message}`);
    return {
      casino: casino.name,
      slug: casino.slug,
      website: casino.website,
      year: null,
      method: 'error',
      notes: `Error: ${error.message}`
    };
  }
}

async function main() {
  console.log('🏢 Researching casino founding dates...\n');
  
  // Get all casinos
  const casinos = await prisma.casino.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      website: true,
      foundedYear: true
    },
    orderBy: { name: 'asc' }
  });
  
  console.log(`Found ${casinos.length} casinos to research\n`);
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results = [];
  
  // Research each casino
  for (const casino of casinos) {
    // Skip if we already have a founded year
    if (casino.foundedYear) {
      console.log(`⏭️  ${casino.name}: Already has founded year (${casino.foundedYear})`);
      results.push({
        casino: casino.name,
        slug: casino.slug,
        website: casino.website,
        year: casino.foundedYear,
        method: 'existing',
        notes: 'Already in database'
      });
      continue;
    }
    
    const result = await scrapeCasinoFounding(browser, casino);
    results.push(result);
    
    // Add delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  await browser.close();
  
  // Save results to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `casino-founding-research-${timestamp}.json`;
  
  fs.writeFileSync(filename, JSON.stringify(results, null, 2));
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 FOUNDING YEAR RESEARCH RESULTS');
  console.log('='.repeat(60));
  
  const found = results.filter(r => r.year && r.method !== 'existing');
  const existing = results.filter(r => r.method === 'existing');
  const notFound = results.filter(r => !r.year && r.method !== 'existing');
  
  console.log(`✅ Successfully found: ${found.length} casinos`);
  console.log(`📋 Already had data: ${existing.length} casinos`);
  console.log(`❌ Not found: ${notFound.length} casinos`);
  
  if (found.length > 0) {
    console.log('\n🎯 NEWLY FOUND FOUNDING YEARS:');
    found.forEach(r => {
      console.log(`  ${r.casino}: ${r.year} (${r.method})`);
    });
  }
  
  if (notFound.length > 0) {
    console.log('\n❓ NEEDS MANUAL RESEARCH:');
    notFound.forEach(r => {
      console.log(`  ${r.casino}: ${r.notes}`);
    });
  }
  
  console.log(`\n💾 Full results saved to: ${filename}`);
  
  // Ask if user wants to update database
  console.log('\n🔄 Would you like to update the database with these findings?');
  console.log('Run: node scripts/update-founding-years.js ' + filename);
}

main()
  .catch(console.error)
  .finally(() => process.exit()); 