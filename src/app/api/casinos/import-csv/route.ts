import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BonusType } from "@prisma/client";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { JWT_SECRET } from "@/lib/auth-utils";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Define a type for decoded JWT token
interface DecodedToken {
  id: string;
  email: string;
  role: string;
}

interface CSVRow {
  name: string;
  bonus: string;
  promoCode?: string;
  logo: string;
  affiliateUrl: string;
  website?: string;
  slug?: string;
}

// Helper function to ensure the images directory exists
async function ensureImagesDir() {
  const imagesDir = path.join(process.cwd(), 'public/images');
  try {
    await mkdir(imagesDir, { recursive: true });
    return imagesDir;
  } catch (error) {
    console.error('Error creating images directory:', error);
    throw error;
  }
}

// Helper function to download and save image from URL
async function downloadAndSaveImage(imageUrl: string): Promise<string> {
  try {
    console.log(`Downloading image from: ${imageUrl}`);
    
    // Fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    // Get content type to determine file extension
    const contentType = response.headers.get('content-type') || '';
    let fileExt = 'png'; // default

    if (contentType.includes('jpeg') || contentType.includes('jpg')) {
      fileExt = 'jpg';
    } else if (contentType.includes('png')) {
      fileExt = 'png';
    } else if (contentType.includes('webp')) {
      fileExt = 'webp';
    } else if (contentType.includes('gif')) {
      fileExt = 'gif';
    } else {
      // Try to get extension from URL
      const urlParts = imageUrl.split('.');
      const possibleExt = urlParts[urlParts.length - 1]?.toLowerCase();
      if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(possibleExt)) {
        fileExt = possibleExt === 'jpeg' ? 'jpg' : possibleExt;
      }
    }

    // Generate unique filename
    const fileName = `${uuidv4()}.${fileExt}`;
    
    // Ensure images directory exists
    const imagesDir = await ensureImagesDir();
    
    // Create file path
    const filePath = path.join(imagesDir, fileName);
    
    // Get image buffer and save
    const imageBuffer = await response.arrayBuffer();
    const fileBuffer = new Uint8Array(imageBuffer);
    await writeFile(filePath, fileBuffer);
    
    const localUrl = `/images/${fileName}`;
    console.log(`Image saved locally as: ${localUrl}`);
    
    return localUrl;
  } catch (error) {
    console.error(`Error downloading image from ${imageUrl}:`, error);
    throw error;
  }
}

// Helper function to process logo field (download if URL, otherwise keep as-is)
async function processLogoField(logo: string | null): Promise<string | null> {
  if (!logo || !logo.trim()) {
    return null;
  }

  const logoTrimmed = logo.trim();
  
  // Check if it's a URL that needs to be downloaded
  if (logoTrimmed.startsWith('http://') || logoTrimmed.startsWith('https://')) {
    try {
      return await downloadAndSaveImage(logoTrimmed);
    } catch (error) {
      console.error(`Failed to download logo from ${logoTrimmed}:`, error);
      // Return the original URL as fallback
      return logoTrimmed;
    }
  }
  
  // If it's already a local path, return as-is
  return logoTrimmed;
}

// Helper function to parse CSV row properly handling quotes
function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < row.length) {
    const char = row[i];
    
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  
  return result;
}

export async function POST(request: NextRequest) {
  try {
    console.log("CSV import started");
    
    // Verify admin authentication using the same pattern as other routes
    let isAuthorized = false;
    
    try {
      const cookieStore = cookies();
      const token = cookieStore.get('admin-token')?.value;
      
      if (token) {
        const decoded = verify(token, JWT_SECRET) as DecodedToken;
        if (decoded.role === "ADMIN") {
          isAuthorized = true;
          console.log("Admin authentication successful");
        }
      }
    } catch (error) {
      console.error("JWT verification error:", error);
    }

    if (!isAuthorized) {
      console.log("Authorization failed");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('csvFile') as File;
    
    if (!file) {
      console.log("No file provided");
      return NextResponse.json({ error: "No CSV file provided" }, { status: 400 });
    }

    if (!file.name.endsWith('.csv')) {
      console.log("Invalid file type:", file.name);
      return NextResponse.json({ error: "File must be a CSV" }, { status: 400 });
    }

    console.log("Processing CSV file:", file.name, "Size:", file.size);

    const csvContent = await file.text();
    console.log("CSV content length:", csvContent.length);
    console.log("First 200 chars:", csvContent.substring(0, 200));
    
    const rows = csvContent.split('\n').filter(row => row.trim() !== '');
    console.log("Total rows found:", rows.length);
    
    if (rows.length < 2) {
      console.log("Insufficient rows");
      return NextResponse.json({ error: "CSV must contain at least a header and one data row" }, { status: 400 });
    }

    // Parse header using improved CSV parser
    const header = parseCSVRow(rows[0]).map(col => col.trim().toLowerCase());
    console.log("Parsed header:", header);
    
    const expectedColumns = ['name', 'bonus', 'promo code', 'logo', 'affiliate url', 'website', 'slug'];
    
    // Create column mapping
    const columnMap: { [key: string]: number } = {};
    expectedColumns.forEach(col => {
      const index = header.findIndex(h => h.includes(col.replace(' ', '')) || h === col);
      if (index !== -1) {
        columnMap[col] = index;
      }
    });

    console.log("Column mapping:", columnMap);

    if (columnMap['name'] === undefined || columnMap['bonus'] === undefined) {
      console.log("Missing required columns");
      return NextResponse.json({ 
        error: "CSV must contain at least 'name' and 'bonus' columns. Found columns: " + header.join(', ')
      }, { status: 400 });
    }

    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as string[],
      downloaded: 0
    };

    // Get highest display order for new casinos
    const highestOrderCasino = await prisma.casino.findFirst({
      orderBy: { displayOrder: 'desc' }
    });
    let nextDisplayOrder = highestOrderCasino ? highestOrderCasino.displayOrder + 1 : 0;

    // Process each data row
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row.trim()) continue;

      try {
        console.log(`Processing row ${i + 1}:`, row);
        
        // Use improved CSV parser
        const columns = parseCSVRow(row);
        console.log(`Parsed columns for row ${i + 1}:`, columns);
        
        const name = columns[columnMap['name']]?.trim();
        const bonus = columns[columnMap['bonus']]?.trim();
        const promoCode = columnMap['promo code'] !== undefined ? 
          columns[columnMap['promo code']]?.trim() || null : null;
        const logoRaw = columnMap['logo'] !== undefined ? 
          columns[columnMap['logo']]?.trim() || null : null;
        const affiliateUrl = columnMap['affiliate url'] !== undefined ? 
          columns[columnMap['affiliate url']]?.trim() || null : null;
        const website = columnMap['website'] !== undefined ? 
          columns[columnMap['website']]?.trim() || null : null;
        const slugFromCsv = columnMap['slug'] !== undefined ? 
          columns[columnMap['slug']]?.trim() || null : null;

        console.log(`Row ${i + 1} data:`, { name, bonus, promoCode, logoRaw, affiliateUrl, website, slugFromCsv });

        if (!name || !bonus) {
          const error = `Row ${i + 1}: Missing required name or bonus (name: "${name}", bonus: "${bonus}")`;
          console.log(error);
          results.errors.push(error);
          results.skipped++;
          continue;
        }

        // Use slug from CSV if provided, otherwise generate from name
        let slug: string;
        if (slugFromCsv && slugFromCsv.trim()) {
          slug = slugFromCsv.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, ''); // Remove leading and trailing dashes
        } else {
          // Generate slug from name
          slug = name.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, ''); // Remove leading and trailing dashes
        }

        console.log(`Generated slug for "${name}": ${slug}`);

        // Check if casino already exists
        const existingCasino = await prisma.casino.findUnique({
          where: { slug }
        });

        if (existingCasino) {
          const error = `Row ${i + 1}: Casino with slug "${slug}" already exists`;
          console.log(error);
          results.errors.push(error);
          results.skipped++;
          continue;
        }

        // Process logo (download if URL, keep as-is otherwise)
        let logo: string | null = null;
        try {
          logo = await processLogoField(logoRaw);
          if (logoRaw && (logoRaw.startsWith('http://') || logoRaw.startsWith('https://'))) {
            results.downloaded++;
          }
        } catch (error) {
          const errorMsg = `Row ${i + 1}: Failed to process logo: ${error instanceof Error ? error.message : 'Unknown error'}`;
          console.error(errorMsg);
          results.errors.push(errorMsg);
          logo = logoRaw; // Use original URL as fallback
        }

        console.log(`Creating casino: ${name}`);

        // Create casino
        const casino = await prisma.casino.create({
          data: {
            name,
            slug,
            logo,
            description: `${name} offers great bonuses and gaming experience.`,
            rating: 0,
            displayOrder: nextDisplayOrder++,
            affiliateLink: affiliateUrl,
            website: website,
            wageringRequirement: null,
            minimumDeposit: null,
            screenshots: []
          }
        });

        console.log(`Created casino with ID: ${casino.id}`);

        // Determine bonus type based on bonus text
        let bonusType: BonusType = BonusType.WELCOME;
        const bonusLower = bonus.toLowerCase();
        if (bonusLower.includes('free spins') || bonusLower.includes('fs')) {
          bonusType = BonusType.FREE_SPINS;
        } else if (bonusLower.includes('no deposit') || bonusLower.includes('free')) {
          bonusType = BonusType.NO_DEPOSIT;
        } else if (bonusLower.includes('cashback') || bonusLower.includes('rakeback')) {
          bonusType = BonusType.CASHBACK;
        } else if (bonusLower.includes('reload')) {
          bonusType = BonusType.RELOAD;
        }

        // Create bonus for the casino
        await prisma.bonus.create({
          data: {
            title: bonus,
            description: bonus,
            code: promoCode,
            types: [bonusType],
            value: bonus,
            casinoId: casino.id
          }
        });

        console.log(`Created bonus for casino: ${name}`);
        results.imported++;
        
      } catch (error) {
        const errorMsg = `Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error("Error processing row:", errorMsg, error);
        results.errors.push(errorMsg);
        results.skipped++;
      }
    }

    console.log("Import completed:", results);

    return NextResponse.json({
      success: true,
      message: `Import completed: ${results.imported} imported, ${results.skipped} skipped, ${results.downloaded} images downloaded`,
      results
    });

  } catch (error) {
    console.error("CSV import error:", error);
    return NextResponse.json(
      { error: `Failed to import CSV: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 