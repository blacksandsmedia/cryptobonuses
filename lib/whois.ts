// Function to extract domain from URL
export function extractDomain(url: string): string | null {
  if (!url) return null;
  
  try {
    // Remove protocol
    let domain = url.replace(/^https?:\/\//, '');
    
    // Remove www prefix
    domain = domain.replace(/^www\./, '');
    
    // Remove path and query parameters
    domain = domain.split('/')[0].split('?')[0];
    
    // Remove port if present
    domain = domain.split(':')[0];
    
    return domain.toLowerCase();
  } catch (error) {
    console.error(`Error extracting domain from ${url}:`, error);
    return null;
  }
}

// Function to get domain registration year via RDAP (official registry protocol)
export async function getDomainRegistrationYear(domain: string): Promise<number | null> {
  try {
    // Get the TLD to determine which RDAP server to use
    const tld = domain.split('.').pop()?.toLowerCase();
    
    let rdapUrl: string;
    
    // Use appropriate RDAP server based on TLD
    switch (tld) {
      case 'com':
      case 'net':
        rdapUrl = `https://rdap.verisign.com/${tld}/v1/domain/${domain}`;
        break;
      case 'org':
        rdapUrl = `https://rdap.publicinterestregistry.org/rdap/domain/${domain}`;
        break;
      case 'io':
        rdapUrl = `https://rdap.nic.io/rdap/domain/${domain}`;
        break;
      case 'gg':
        rdapUrl = `https://rdap.gg/rdap/domain/${domain}`;
        break;
      case 'lv':
        rdapUrl = `https://rdap.nic.lv/rdap/domain/${domain}`;
        break;
      case 'eu':
        rdapUrl = `https://rdap.eu/rdap/domain/${domain}`;
        break;
      case 'bet':
        rdapUrl = `https://rdap.nic.bet/rdap/domain/${domain}`;
        break;
      case 'win':
        rdapUrl = `https://rdap.nic.win/rdap/domain/${domain}`;
        break;
      default:
        // Fallback to a generic RDAP bootstrap service
        rdapUrl = `https://rdap.org/domain/${domain}`;
    }
    
    console.log(`🔍 Looking up RDAP data for: ${domain} (${tld})`);
    
    const response = await fetch(rdapUrl);
    
    if (!response.ok) {
      throw new Error(`RDAP request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Look for registration event in the events array
    if (data.events && Array.isArray(data.events)) {
      const registrationEvent = data.events.find((event: any) => 
        event.eventAction === 'registration'
      );
      
      if (registrationEvent && registrationEvent.eventDate) {
        const date = new Date(registrationEvent.eventDate);
        const year = date.getFullYear();
        
        // Validate year (should be reasonable - between 1990 and current year)
        const currentYear = new Date().getFullYear();
        if (year < 1990 || year > currentYear) {
          console.warn(`⚠️  Invalid year ${year} for domain: ${domain}`);
          return null;
        }
        
        console.log(`✅ Found registration year: ${year} for ${domain}`);
        return year;
      }
    }
    
    console.warn(`⚠️  No registration date found for domain: ${domain}`);
    return null;
    
  } catch (error) {
    console.error(`❌ Error fetching RDAP data for ${domain}:`, error);
    return null;
  }
}

// Function to get casino founded year from website URL
export async function getCasinoFoundedYear(websiteUrl: string): Promise<number | null> {
  const domain = extractDomain(websiteUrl);
  
  if (!domain) {
    console.error(`Could not extract domain from URL: ${websiteUrl}`);
    return null;
  }
  
  console.log(`Looking up registration year for domain: ${domain}`);
  
  const year = await getDomainRegistrationYear(domain);
  
  if (year) {
    console.log(`Found registration year ${year} for ${domain}`);
  } else {
    console.warn(`Could not determine registration year for ${domain}`);
  }
  
  return year;
} 