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

async function generateUniqueUsername(name, userId) {
  const baseUsername = generateBaseUsername(name);
  
  // Check if base username is available
  const existingUser = await prisma.user.findFirst({
    where: { 
      username: baseUsername,
      id: { not: userId } // Exclude the current user
    }
  });

  if (!existingUser) {
    return baseUsername;
  }

  // If base username exists, try with numbers
  let counter = 1;
  let uniqueUsername = `${baseUsername}-${counter}`;
  
  while (counter < 1000) { // Limit attempts to prevent infinite loop
    const existing = await prisma.user.findFirst({
      where: { 
        username: uniqueUsername,
        id: { not: userId } // Exclude the current user
      }
    });
    
    if (!existing) {
      return uniqueUsername;
    }
    
    counter++;
    uniqueUsername = `${baseUsername}-${counter}`;
  }

  // If all attempts fail, use a random string
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${baseUsername}-${randomSuffix}`;
}

async function ensureAllUsersHaveUsernames() {
  try {
    console.log('🔍 Checking for users without usernames...');

    // Find users without usernames
    const usersWithoutUsernames = await prisma.user.findMany({
      where: {
        OR: [
          { username: null },
          { username: '' }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true
      }
    });

    console.log(`📊 Found ${usersWithoutUsernames.length} users without usernames`);

    if (usersWithoutUsernames.length === 0) {
      console.log('✅ All users already have usernames!');
      return;
    }

    console.log('🔧 Generating usernames...');

    for (const user of usersWithoutUsernames) {
      try {
        const newUsername = await generateUniqueUsername(user.name || user.email, user.id);
        
        await prisma.user.update({
          where: { id: user.id },
          data: { username: newUsername }
        });

        console.log(`✅ Updated user ${user.email}: ${user.username || '(none)'} → ${newUsername}`);
      } catch (error) {
        console.error(`❌ Failed to update user ${user.email}:`, error.message);
      }
    }

    console.log('🎉 Username generation complete!');

  } catch (error) {
    console.error('❌ Error ensuring usernames:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
ensureAllUsersHaveUsernames(); 