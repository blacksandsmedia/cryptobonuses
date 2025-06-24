const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Railway database URL - replace with your actual Railway PostgreSQL URL
const RAILWAY_DATABASE_URL = "postgresql://postgres:sfMJppsPfMKvFQUYOuWWgIvXdvoGwkCV@crossover.proxy.rlwy.net:51878/railway";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: RAILWAY_DATABASE_URL
    }
  }
});

async function createAdminUser() {
  console.log('Creating admin user in Railway database...');
  console.log('Database URL:', RAILWAY_DATABASE_URL.replace(/:[^:@]*@/, ':****@'));

  try {
    // Test connection
    await prisma.$connect();
    console.log('✓ Connected to Railway database');

    // Get admin credentials from environment or use defaults
    const email = process.env.ADMIN_EMAIL || 'admin@cryptobonuses.com';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const name = 'Admin User';

    console.log(`Creating admin user with email: ${email}`);

    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('Admin user already exists, updating password...');
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
        }
      });
      console.log('✓ Admin user updated:', { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role });
    } else {
      console.log('Creating new admin user...');
      const newUser = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: 'ADMIN',
        }
      });
      console.log('✓ Admin user created:', { id: newUser.id, email: newUser.email, role: newUser.role });
    }

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('✓ Database connection closed');
  }
}

createAdminUser()
  .catch((e) => {
    console.error('Failed to create admin user:', e);
    process.exit(1);
  }); 