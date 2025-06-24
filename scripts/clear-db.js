const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearDatabase() {
  console.log('Clearing database...');
  
  try {
    // First delete all reviews (they reference casinos)
    await prisma.review.deleteMany();
    console.log('✓ All reviews deleted');
    
    // Then delete all bonuses (they reference casinos)
    await prisma.bonus.deleteMany();
    console.log('✓ All bonuses deleted');
    
    // Finally delete all casinos
    await prisma.casino.deleteMany();
    console.log('✓ All casinos deleted');
    
    console.log('Database cleared successfully!');
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
clearDatabase(); 