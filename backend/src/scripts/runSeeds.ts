import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

async function runSeeds() {
  console.log('🚀 Starting database seeding process...\n');

  try {
    // Run user seeder
    console.log('1️⃣ Running user seeder...');
    await execAsync('npx tsx src/scripts/seedUsers.ts');
    
    // Run parking lots seeder
    console.log('\n2️⃣ Running parking lots seeder...');
    await execAsync('npx tsx src/scripts/seedParkingLots.ts');
    
    console.log('\n✅ All seeds completed successfully!');
    console.log('\n🎉 Your database is now ready for testing!');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runSeeds();
