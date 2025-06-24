const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Sample data for casinos and bonuses based on the actual website
const casinos = [
  {
    name: 'BC Game',
    slug: 'bc-game',
    logo: '/images/BC Game Logo (1).png',
    description: 'Popular crypto casino with unique games and a strong community focus.',
    rating: 4.9,
    bonuses: [
      {
        title: '5 BTC + $220K',
        description: 'Get up to 5 BTC plus $220K in bonuses with promo code BCBONUS.',
        code: 'BCBONUS',
        types: ['WELCOME'],
        value: '5 BTC + $220K',
      }
    ]
  },
  {
    name: 'Stake',
    slug: 'stake',
    logo: '/images/Stake Logo (1).png',
    description: 'One of the largest crypto casinos with a wide range of games and sports betting options.',
    rating: 4.8,
    bonuses: [
      {
        title: '$2K FREE',
        description: 'Get $2,000 free when you sign up with promo code TOPBONUS.',
        code: 'TOPBONUS',
        types: ['NO_DEPOSIT'],
        value: '$2K FREE',
      }
    ]
  },
  {
    name: 'Bitstarz',
    slug: 'bitstarz',
    logo: '/images/BitStarz Logo (2).png',
    description: 'Award-winning crypto casino with thousands of games and fast payouts.',
    rating: 4.9,
    bonuses: [
      {
        title: '5 BTC + 205 FS',
        description: 'Get up to 5 BTC and 205 free spins with promo code TOPBONUS.',
        code: 'TOPBONUS',
        types: ['WELCOME'],
        value: '5 BTC + 205 FS',
      }
    ]
  },
  {
    name: 'Wild.io',
    slug: 'wild-io',
    logo: '/images/Wild IO Logo.png',
    description: 'Exciting crypto casino with a wide variety of games and generous bonuses.',
    rating: 4.7,
    bonuses: [
      {
        title: '$10K + 300 FS',
        description: 'Get up to $10,000 and 300 free spins with promo code TOPBONUS.',
        code: 'TOPBONUS',
        types: ['WELCOME'],
        value: '$10K + 300 FS',
      }
    ]
  },
  {
    name: 'Winz.io',
    slug: 'winz-io',
    logo: '/images/Winz IO Logo.png',
    description: 'Modern crypto casino with a large selection of games and fast withdrawals.',
    rating: 4.6,
    bonuses: [
      {
        title: 'WIN $5K',
        description: 'Win up to $5,000 with promo code WBONUS.',
        code: 'WBONUS',
        types: ['WELCOME'],
        value: 'WIN $5K',
      }
    ]
  },
  {
    name: 'Betplay.io',
    slug: 'betplay-io',
    logo: '/images/Betplay IO Logo.png',
    description: 'Crypto casino with a focus on sports betting and casino games.',
    rating: 4.5,
    bonuses: [
      {
        title: '1,000 USDT',
        description: 'Get up to 1,000 USDT in welcome bonuses.',
        types: ['WELCOME'],
        value: '1,000 USDT',
      }
    ]
  },
  {
    name: 'Justbit',
    slug: 'justbit',
    logo: '/images/Justbit Logo (2).png',
    description: 'Fast-growing crypto casino with excellent game selection and customer support.',
    rating: 4.5,
    bonuses: [
      {
        title: '€750 + 75 FS',
        description: 'Get up to €750 and 75 free spins on your first deposit.',
        types: ['WELCOME'],
        value: '€750 + 75 FS',
      }
    ]
  },
  {
    name: 'BetFury',
    slug: 'betfury',
    logo: '/images/BetFury Logo (2).png',
    description: 'Innovative crypto casino with its own token and staking options.',
    rating: 4.7,
    bonuses: [
      {
        title: '590% + 225 FS',
        description: 'Get a 590% bonus and 225 free spins with promo code BFBONUS.',
        code: 'BFBONUS',
        types: ['WELCOME'],
        value: '590% + 225 FS',
      }
    ]
  },
  {
    name: 'Gamdom',
    slug: 'gamdom',
    logo: '/images/Gamdom Logo (4).png',
    description: 'Popular crypto casino with CS:GO gambling and traditional casino games.',
    rating: 4.5,
    bonuses: [
      {
        title: 'FREE CHEST',
        description: 'Get a free chest with valuable rewards with code bonusvip.',
        code: 'bonusvip',
        types: ['NO_DEPOSIT'],
        value: 'FREE CHEST',
      }
    ]
  },
  {
    name: 'Shuffle.com',
    slug: 'shuffle',
    logo: '/images/Shuffle com Logo.png',
    description: 'Modern crypto casino with unique games and a sleek interface.',
    rating: 4.6,
    bonuses: [
      {
        title: '$1K',
        description: 'Get up to $1,000 in bonuses with promo code SBONUS.',
        code: 'SBONUS',
        types: ['WELCOME'],
        value: '$1K',
      }
    ]
  },
  {
    name: 'FortuneJack',
    slug: 'fortunejack',
    logo: '/images/FortuneJack Logo (1).png',
    description: 'Established crypto casino with a huge game selection and generous bonuses.',
    rating: 4.7,
    bonuses: [
      {
        title: '6.5 BTC + 350 FS',
        description: 'Get up to 6.5 BTC and 350 free spins with promo code JACKPOT.',
        code: 'JACKPOT',
        types: ['WELCOME'],
        value: '6.5 BTC + 350 FS',
      }
    ]
  },
  {
    name: 'Jackbit',
    slug: 'jackbit',
    logo: '/images/Jackbit Logo.png',
    description: 'New crypto casino with excellent bonuses and promotions.',
    rating: 4.5,
    bonuses: [
      {
        title: '100 FREE SPINS',
        description: 'Get 100 free spins with promo code JACKPROMO.',
        code: 'JACKPROMO',
        types: ['FREE_SPINS'],
        value: '100 FREE SPINS',
      }
    ]
  }
];

async function seedData() {
  console.log('Starting database seeding...');
  
  try {
    // Insert each casino and its bonuses
    for (const casinoData of casinos) {
      const { bonuses, ...casino } = casinoData;
      
      console.log(`Creating casino: ${casino.name}`);
      
      // Create casino first
      const createdCasino = await prisma.casino.create({
        data: casino
      });
      
      // Then create all bonuses for this casino
      for (const bonus of bonuses) {
        console.log(`  - Adding bonus: ${bonus.title}`);
        await prisma.bonus.create({
          data: {
            ...bonus,
            casinoId: createdCasino.id
          }
        });
      }
    }
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedData(); 