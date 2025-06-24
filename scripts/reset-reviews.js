const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function resetReviews() {
  console.log('Resetting all reviews in the database...');

  try {
    // Delete all existing reviews
    const deletedCount = await prisma.review.deleteMany({});
    console.log(`Deleted ${deletedCount.count} existing reviews.`);

    // Find the Stake casino
    const stakeCasino = await prisma.casino.findFirst({
      where: { slug: 'stake' }
    });

    if (!stakeCasino) {
      console.error('Error: Stake casino not found in the database.');
      return;
    }

    console.log('Found Stake casino:', stakeCasino.id, stakeCasino.name);

    // Create a new review for Stake
    const newReview = await prisma.review.create({
      data: {
        author: 'John Smith',
        content: 'Stake is an amazing crypto casino with a wide range of games and great bonuses. The interface is intuitive and user-friendly. Withdrawals are processed quickly and the customer support is excellent.',
        rating: 4.8,
        casinoId: stakeCasino.id,
      },
    });

    console.log('Created new sample review:', newReview);
    console.log('Review reset completed successfully!');
  } catch (error) {
    console.error('Error resetting reviews:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
resetReviews(); 