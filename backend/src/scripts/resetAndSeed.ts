import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

async function resetAndSeedDatabase() {
  console.log('🔄 Resetting and seeding database...\n');

  try {
    // Step 1: Reset database
    console.log('1️⃣ Resetting database...');
    await execAsync('npx prisma migrate reset --force');
    
    // Step 2: Generate Prisma client
    console.log('\n2️⃣ Generating Prisma client...');
    await execAsync('npx prisma generate');
    
    // Step 3: Run migrations
    console.log('\n3️⃣ Running migrations...');
    await execAsync('npx prisma migrate deploy');
    
    // Step 4: Seed users
    console.log('\n4️⃣ Seeding users...');
    await execAsync('npx tsx src/scripts/seedUsers.ts');
    
    // Step 5: Seed parking lots
    console.log('\n5️⃣ Seeding parking lots...');
    await execAsync('npx tsx src/scripts/seedParkingLots.ts');
    
    // Step 6: Seed bookings
    console.log('\n6️⃣ Seeding bookings...');
    await execAsync('npx tsx src/scripts/seedBookings.ts');
    
    console.log('\n✅ Database reset and seeding completed successfully!');
    console.log('\n🎉 Your application is ready for testing!');
    
    console.log('\n📋 Quick Start Guide:');
    console.log('====================');
    console.log('1. 👤 Login as Owner: carlos@parqueoapp.com');
    console.log('2. 🚗 Login as Driver: juan.perez@gmail.com');
    console.log('3. 🔐 Password for all users: password123');
    console.log('4. 📱 Test different booking scenarios');
    console.log('5. 💳 Use Stripe test cards for payments');
    
  } catch (error) {
    console.error('❌ Error during database reset and seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetAndSeedDatabase();
