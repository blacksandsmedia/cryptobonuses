const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupTestData() {
  console.log('Setting up test data for reporting system...');

  try {
    // First, check if any casinos exist
    const existingCasinos = await prisma.casino.findMany({
      take: 5,
      select: { id: true, name: true, slug: true }
    });

    let casinos = existingCasinos;

    // If no casinos exist, create a few simple ones
    if (casinos.length === 0) {
      console.log('No casinos found, creating test casinos...');
      
      const testCasinos = [
        {
          name: 'Test Casino A',
          slug: 'test-casino-a',
          description: 'Test casino for reporting system',
          rating: 4.5
        },
        {
          name: 'Test Casino B', 
          slug: 'test-casino-b',
          description: 'Another test casino for reporting system',
          rating: 4.0
        },
        {
          name: 'Test Casino C',
          slug: 'test-casino-c', 
          description: 'Third test casino for reporting system',
          rating: 3.5
        }
      ];

      for (const casino of testCasinos) {
        const created = await prisma.casino.create({
          data: casino,
          select: { id: true, name: true, slug: true }
        });
        casinos.push(created);
        console.log(`✅ Created casino: ${created.name}`);
      }
    } else {
      console.log(`Found ${casinos.length} existing casinos, using them for test reports.`);
    }

    // Now create test reports
    const testReports = [
      {
        casinoId: casinos[0]?.id,
        reason: 'MISLEADING_BONUSES',
        description: 'This casino advertises a 500% bonus but the actual bonus is only 100%. Very misleading advertising.',
        reporterIp: '192.168.1.100'
      },
      {
        casinoId: casinos[1]?.id || casinos[0]?.id,
        reason: 'PAYMENT_DELAYS',
        description: 'I have been waiting for my withdrawal for over 2 weeks. They keep giving excuses.',
        reporterIp: '192.168.1.101'
      },
      {
        casinoId: casinos[2]?.id || casinos[0]?.id,
        reason: 'POOR_CUSTOMER_SERVICE',
        description: 'Customer support is very rude and unhelpful. They refuse to solve my issue.',
        reporterIp: '192.168.1.102'
      }
    ].filter(report => report.casinoId); // Only include reports with valid casino IDs

    console.log('\nCreating test reports...');
    for (const report of testReports) {
      try {
        const created = await prisma.casinoReport.create({
          data: report,
          include: {
            casino: {
              select: { name: true }
            }
          }
        });
        console.log(`✅ Created report for ${created.casino.name}: ${report.reason}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Report already exists for IP ${report.reporterIp}`);
        } else {
          console.error('Error creating report:', error);
        }
      }
    }

    console.log('\n🎉 Test setup complete!');
    console.log('\nNext steps:');
    console.log('1. Visit http://localhost:3000/admin/reports to see pending reports');
    console.log('2. Use the ✓ Verify buttons for one-click verification');
    console.log('3. Test submitting new reports on individual casino pages');

  } catch (error) {
    console.error('Error setting up test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestData(); 