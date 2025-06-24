const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function generateBaseUsername(name) {
  if (!name || name.trim() === '') {
    return 'user';
  }

  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 20) // Limit length
    || 'user'; // Fallback if everything was removed
}

async function generateUniqueUsername(name, existingUsernames) {
  const baseUsername = generateBaseUsername(name);
  
  // Check if base username is available
  if (!existingUsernames.has(baseUsername)) {
    existingUsernames.add(baseUsername);
    return baseUsername;
  }

  // If base username exists, try with numbers
  let counter = 1;
  let uniqueUsername = `${baseUsername}-${counter}`;
  
  while (counter < 1000) { // Limit attempts to prevent infinite loop
    if (!existingUsernames.has(uniqueUsername)) {
      existingUsernames.add(uniqueUsername);
      return uniqueUsername;
    }
    
    counter++;
    uniqueUsername = `${baseUsername}-${counter}`;
  }

  // If all attempts fail, use a random string
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const finalUsername = `${baseUsername}-${randomSuffix}`;
  existingUsernames.add(finalUsername);
  return finalUsername;
}

async function generateUsernamesForExistingUsers() {
  try {
    console.log('🔍 Finding users without usernames...');
    
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
      }
    });

    console.log(`📊 Found ${users.length} total users`);

    // Get existing usernames to avoid duplicates
    const existingUsernames = new Set();
    const usersWithoutUsernames = [];

    for (const user of users) {
      if (user.username) {
        existingUsernames.add(user.username);
      } else {
        usersWithoutUsernames.push(user);
      }
    }

    console.log(`✨ ${usersWithoutUsernames.length} users need usernames`);

    if (usersWithoutUsernames.length === 0) {
      console.log('🎉 All users already have usernames!');
      return;
    }

    // Generate usernames for users who don't have them
    let updated = 0;
    for (const user of usersWithoutUsernames) {
      const username = await generateUniqueUsername(user.name || user.email, existingUsernames);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { username }
      });

      console.log(`✅ Generated username "${username}" for user: ${user.name || user.email}`);
      updated++;
    }

    console.log(`🎊 Successfully generated usernames for ${updated} users!`);
  } catch (error) {
    console.error('❌ Error generating usernames:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
generateUsernamesForExistingUsers()
  .then(() => {
    console.log('🏁 Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }); 