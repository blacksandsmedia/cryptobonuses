const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSampleReviews() {
  console.log('Creating sample reviews for BetFury...');

  try {
    // Find BetFury casino by slug
    const casino = await prisma.casino.findFirst({
      where: { slug: 'betfury' }
    });

    if (!casino) {
      console.error('BetFury casino not found');
      return;
    }

    // Create a verified sample review
    const verifiedReview = await prisma.review.create({
      data: {
        author: 'Test User',
        content: 'This is a test review for BetFury. Great gaming experience with fast payouts and excellent customer service.',
        rating: 5,
        casinoId: casino.id,
        verified: true // This review is verified
      }
    });

    console.log('Verified sample review created successfully:');
    console.log(verifiedReview);

    // Create an unverified sample review
    const unverifiedReview = await prisma.review.create({
      data: {
        author: 'Testin',
        content: 'testing',
        rating: 5,
        casinoId: casino.id,
        verified: false // This review is unverified
      }
    });

    console.log('Unverified sample review created successfully:');
    console.log(unverifiedReview);
  } catch (error) {
    console.error('Error creating sample reviews:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleReviews(); 