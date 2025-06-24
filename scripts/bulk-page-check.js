const fetch = require('node-fetch');

async function bulkCheckAllCasinos() {
  try {
    // First, get all casinos
    const casinosResponse = await fetch('http://localhost:3000/api/casinos');
    const casinosData = await casinosResponse.json();
    
    if (!casinosData.success) {
      throw new Error('Failed to fetch casinos');
    }

    const casinoSlugs = casinosData.casinos.map(casino => casino.slug);
    
    console.log(`Found ${casinoSlugs.length} casinos to check`);

    // Perform bulk page check
    const response = await fetch('http://localhost:3000/api/page-checks/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // You'll need to include admin authentication cookie or token here
        'Cookie': 'admin-token=YOUR_ADMIN_TOKEN_HERE'
      },
      body: JSON.stringify({
        pageSlugs: casinoSlugs,
        pageType: 'casino',
        notes: 'Automated bulk check - ' + new Date().toISOString(),
        isAutomatic: true
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Successfully created page checks for ${casinoSlugs.length} casinos`);
    } else {
      console.error('❌ Bulk check failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Error performing bulk check:', error);
  }
}

// Run the script
bulkCheckAllCasinos(); 