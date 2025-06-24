const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const legalPages = [
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    content: `
<h1>Privacy Policy</h1>

<p><strong>Last updated:</strong> ${new Date().toLocaleDateString()}</p>

<h2>Information We Collect</h2>
<p>We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, or contact us for support.</p>

<h2>How We Use Your Information</h2>
<p>We use the information we collect to:</p>
<ul>
  <li>Provide, maintain, and improve our services</li>
  <li>Send you technical notices and support messages</li>
  <li>Respond to your comments and questions</li>
  <li>Monitor and analyze trends and usage</li>
</ul>

<h2>Information Sharing</h2>
<p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>

<h2>Data Security</h2>
<p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

<h2>Contact Us</h2>
<p>If you have any questions about this Privacy Policy, please contact us at support@cryptobonuses.com</p>
    `.trim()
  },
  {
    slug: 'terms',
    title: 'Terms of Service',
    content: `
<h1>Terms of Service</h1>

<p><strong>Last updated:</strong> ${new Date().toLocaleDateString()}</p>

<h2>Acceptance of Terms</h2>
<p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>

<h2>Use License</h2>
<p>Permission is granted to temporarily download one copy of the materials on CryptoBonuses' website for personal, non-commercial transitory viewing only.</p>

<h2>Disclaimer</h2>
<p>The materials on CryptoBonuses' website are provided on an 'as is' basis. CryptoBonuses makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>

<h2>Limitations</h2>
<p>In no event shall CryptoBonuses or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on CryptoBonuses' website.</p>

<h2>Accuracy of Materials</h2>
<p>The materials appearing on CryptoBonuses' website could include technical, typographical, or photographic errors. CryptoBonuses does not warrant that any of the materials on its website are accurate, complete, or current.</p>

<h2>Contact Information</h2>
<p>If you have any questions about these Terms of Service, please contact us at support@cryptobonuses.com</p>
    `.trim()
  },
  {
    slug: 'contact',
    title: 'Contact Us',
    content: `
<h1>Contact Us</h1>

<p>We'd love to hear from you! Get in touch with us using any of the methods below.</p>

<h2>General Inquiries</h2>
<p><strong>Email:</strong> support@cryptobonuses.com</p>

<h2>Business Partnerships</h2>
<p><strong>Email:</strong> partnerships@cryptobonuses.com</p>

<h2>Press & Media</h2>
<p><strong>Email:</strong> press@cryptobonuses.com</p>

<h2>Response Time</h2>
<p>We typically respond to all inquiries within 24-48 hours during business days.</p>

<h2>Office Hours</h2>
<p>Monday - Friday: 9:00 AM - 6:00 PM (UTC)</p>
<p>Saturday - Sunday: Limited support available</p>

<h2>Submit a Report</h2>
<p>If you want to report an issue with a casino, please use our reporting system on the individual casino pages.</p>
    `.trim()
  }
];

async function seedLegalPages() {
  console.log('Creating legal pages...');
  
  try {
    for (const page of legalPages) {
      try {
        const created = await prisma.legalPage.create({
          data: page
        });
        console.log(`✅ Created legal page: ${created.title}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Legal page already exists: ${page.title}`);
        } else {
          console.error(`Error creating ${page.title}:`, error);
        }
      }
    }
    
    console.log('\n🎉 Legal pages setup complete!');
  } catch (error) {
    console.error('Error seeding legal pages:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedLegalPages(); 