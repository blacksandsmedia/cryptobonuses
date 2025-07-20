import { PrismaClient, BonusType } from '@prisma/client';
import { hash } from 'bcryptjs';
import { casinoBonuses } from '../src/data/casinoBonuses';

const prisma = new PrismaClient();

async function main() {
  // Create admin user with password
  const adminPassword = await hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  console.log({ admin });

  // Process each casino from the website data
  for (const [index, casinoData] of casinoBonuses.entries()) {
    if (!casinoData.isActive) continue;

    // Create or update the casino
    const casino = await prisma.casino.upsert({
      where: { slug: casinoData.id },
      update: {
        name: casinoData.casinoName,
        logo: casinoData.logoUrl,
        description: `${casinoData.casinoName} is a crypto casino offering various bonuses and promotions.`,
        rating: 4.0, // Default rating
        affiliateLink: casinoData.affiliateLink || '',
        displayOrder: index, // Set display order based on position in array
      },
      create: {
        name: casinoData.casinoName,
        slug: casinoData.id,
        logo: casinoData.logoUrl,
        description: `${casinoData.casinoName} is a crypto casino offering various bonuses and promotions.`,
        rating: 4.0, // Default rating
        affiliateLink: casinoData.affiliateLink || '',
        displayOrder: index, // Set display order based on position in array
      },
    });

    // Map the website bonus type to the database enum
    let bonusTypes: BonusType[] = [BonusType.WELCOME];
    switch (casinoData.bonusType) {
      case 'free':
        bonusTypes = [BonusType.NO_DEPOSIT];
        break;
      case 'free_spins':
        bonusTypes = [BonusType.FREE_SPINS];
        break;
      case 'deposit':
        bonusTypes = [BonusType.DEPOSIT];
        break;
      case 'rakeback':
        bonusTypes = [BonusType.CASHBACK];
        break;
      case 'other':
        bonusTypes = [BonusType.WELCOME]; // Map 'other' to welcome as default
        break;
      default:
        bonusTypes = [BonusType.WELCOME];
    }

    // Create the bonus for this casino
    await prisma.bonus.upsert({
      where: {
        id: `${casinoData.id}-main-bonus`,
      },
      update: {
        title: casinoData.bonusText,
        description: casinoData.bonusText,
        code: casinoData.promoCode || null,
        types: bonusTypes,
        value: casinoData.bonusValue.toString(),
      },
      create: {
        id: `${casinoData.id}-main-bonus`,
        title: casinoData.bonusText,
        description: casinoData.bonusText,
        code: casinoData.promoCode || null,
        types: bonusTypes,
        value: casinoData.bonusValue.toString(),
        casinoId: casino.id,
      },
    });

    // Add sample reviews if they don't exist yet
    const reviewCount = await prisma.review.count({
      where: { casinoId: casino.id },
    });

    if (reviewCount === 0) {
      await prisma.review.create({
        data: {
          author: 'John Doe',
          content: `Great experience at ${casinoData.casinoName}. The bonus was easy to claim and the games are entertaining.`,
          rating: 4.5,
          verified: true,
          casinoId: casino.id,
        },
      });

      await prisma.review.create({
        data: {
          author: 'Jane Smith',
          content: `${casinoData.casinoName} has a wide selection of games and their customer service is excellent.`,
          rating: 4.0,
          verified: true,
          casinoId: casino.id,
        },
      });
    }
  }

  // Get all casinos to ensure they have display order set
  const allCasinos = await prisma.casino.findMany({
    orderBy: {
      displayOrder: 'asc',
    },
  });
  
  // Assign sequential display orders if needed
  for (const [index, casino] of allCasinos.entries()) {
    // If the displayOrder is wrong or doesn't match its position, update it
    if (casino.displayOrder !== index) {
      await prisma.casino.update({
        where: { id: casino.id },
        data: { displayOrder: index },
      });
    }
  }

  console.log('Database has been seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 