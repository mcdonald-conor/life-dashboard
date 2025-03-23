// Simple script to test database connection
const { PrismaClient } = require('@prisma/client');

// Log the DATABASE_URL format (partially hidden for security)
const dbUrl = process.env.DATABASE_URL || 'No DATABASE_URL found!';
console.log('DATABASE_URL protocol:', dbUrl.split('://')[0]);
console.log('DATABASE_URL host:', dbUrl.split('@')[1]?.split(':')[0] || 'unknown');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  try {
    console.log('Attempting to connect to database...');
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Connection successful!', result);
    return true;
  } catch (error) {
    console.error('Connection failed with error:');
    console.error(error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

testConnection()
  .then(success => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch(e => {
    console.error('Unhandled error:', e);
    process.exit(1);
  });
