const { sign, verify } = require('jsonwebtoken');

console.log('=== Environment Variables Check ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('AUTH_SECRET:', process.env.AUTH_SECRET ? `Set (${process.env.AUTH_SECRET.length} chars)` : 'Not set');
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? `Set (${process.env.NEXTAUTH_SECRET.length} chars)` : 'Not set');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

// Determine which JWT secret would be used
const JWT_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'cryptobonuses-jwt-secret-2024';
console.log('\n=== JWT Secret Resolution ===');
console.log('Final JWT_SECRET:', JWT_SECRET.substring(0, 10) + '...');
console.log('JWT_SECRET length:', JWT_SECRET.length);
console.log('Source:', process.env.AUTH_SECRET ? 'AUTH_SECRET' : process.env.NEXTAUTH_SECRET ? 'NEXTAUTH_SECRET' : 'fallback');

// Test JWT token creation and verification
console.log('\n=== JWT Test ===');
try {
  const testPayload = {
    id: 'test-id',
    email: 'test@example.com',
    role: 'ADMIN'
  };

  // Create token
  const token = sign(testPayload, JWT_SECRET, { expiresIn: '24h' });
  console.log('✓ Token created successfully');
  console.log('Token length:', token.length);
  console.log('Token parts:', token.split('.').length);

  // Verify token
  const decoded = verify(token, JWT_SECRET);
  console.log('✓ Token verified successfully');
  console.log('Decoded payload:', decoded);

} catch (error) {
  console.error('❌ JWT test failed:', error.message);
}

console.log('\n=== Recommendations ===');
if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
  console.log('⚠️  Consider setting AUTH_SECRET environment variable in production');
  console.log('   This ensures consistent JWT secrets across deployments');
}

if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'cryptobonuses-jwt-secret-2024') {
  console.log('⚠️  Using fallback JWT secret in production');
  console.log('   Set AUTH_SECRET environment variable for better security');
}

console.log('\n=== Railway Environment Variable Commands ===');
console.log('To set environment variables in Railway:');
console.log('railway variables set AUTH_SECRET=your-secret-here');
console.log('railway variables set NEXTAUTH_SECRET=your-secret-here');
console.log('\nTo view current variables:');
console.log('railway variables'); 