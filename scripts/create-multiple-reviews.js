const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Sample review content templates
const reviewTemplates = [
  {
    positive: "{casino} offers excellent bonuses and a wide variety of games. The withdrawal process is fast and hassle-free.",
    rating: 4.8
  },
  {
    positive: "I've had a great experience with {casino}. Their customer support is responsive and the platform is very user-friendly.",
    rating: 4.6
  },
  {
    positive: "{casino} has become my favorite crypto casino. The games are fair and the interface is intuitive. Highly recommend!",
    rating: 4.9
  },
  {
    positive: "Playing at {casino} has been fantastic. Quick withdrawals and great selection of games. Their bonuses are generous too.",
    rating: 4.7
  },
  {
    positive: "I've tried several crypto casinos, but {casino} stands out for its reliability and impressive game selection.",
    rating: 4.5
  }
];

// Sample author names
const authorNames = [
  "John Smith",
  "Emma Johnson",
  "Michael Brown",
  "Sarah Davis",
  "David Wilson",
  "Jennifer Taylor",
  "James Anderson",
  "Lisa Thomas",
  "Robert White",
  "Mary Harris",
  "William Clark",
  "Patricia Lewis",
  "Richard Moore",
  "Linda Walker",
  "Thomas Hall"
];

async function createMultipleReviews() {
  console.log('Creating reviews for all casinos...');

  try {
    // First delete all existing reviews
    const deletedCount = await prisma.review.deleteMany({});
    console.log(`Deleted ${deletedCount.count} existing reviews`);
    
    // Get all casinos
    const casinos = await prisma.casino.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log(`Found ${casinos.length} casinos`);
    
    let reviewsCreated = 0;
    
    // Create 1-3 reviews for each casino
    for (const casino of casinos) {
      const numReviews = Math.floor(Math.random() * 3) + 1; // 1 to 3 reviews per casino
      
      for (let i = 0; i < numReviews; i++) {
        // Get random review template and author
        const template = reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)];
        const author = authorNames[Math.floor(Math.random() * authorNames.length)];
        
        // Replace {casino} placeholder with actual casino name
        const content = template.positive.replace('{casino}', casino.name);
        
        // Add slight variation to rating (±0.2)
        const ratingVariation = (Math.random() * 0.4) - 0.2;
        const rating = Math.min(5, Math.max(3.5, template.rating + ratingVariation));
        
        // Create the review
        const review = await prisma.review.create({
          data: {
            author,
            content,
            rating,
            casinoId: casino.id
          }
        });
        
        reviewsCreated++;
        console.log(`Created review #${reviewsCreated} for ${casino.name}`);
      }
    }
    
    console.log(`Successfully created ${reviewsCreated} reviews across ${casinos.length} casinos!`);
  } catch (error) {
    console.error('Error creating reviews:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
createMultipleReviews(); 