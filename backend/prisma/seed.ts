import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Create sample driver
  const driver = await prisma.user.create({
    data: {
      name: 'Juan Pérez',
      email: 'juan.driver@example.com',
      password: hashedPassword,
      role: 'DRIVER'
    }
  });

  // Create sample owner
  const owner = await prisma.user.create({
    data: {
      name: 'María García',
      email: 'maria.owner@example.com',
      password: hashedPassword,
      role: 'OWNER'
    }
  });

  // Create sample parking lots
  const parkingLot1 = await prisma.parkingLot.create({
    data: {
      name: 'Parqueadero Centro',
      address: 'Calle 10 #15-25, Bogotá',
      latitude: 4.5981,
      longitude: -74.0758,
      pricePerHour: 3000,
      totalSpaces: 50,
      availableSpaces: 25,
      operatingHours: '24 horas',
      amenities: 'Vigilancia, Cubierto, Lavado de carros',
      ownerId: owner.id
    }
  });

  const parkingLot2 = await prisma.parkingLot.create({
    data: {
      name: 'Estacionamiento Plaza',
      address: 'Carrera 7 #32-18, Bogotá',
      latitude: 4.6126,
      longitude: -74.0705,
      pricePerHour: 2500,
      totalSpaces: 30,
      availableSpaces: 15,
      operatingHours: '6:00 AM - 10:00 PM',
      amenities: 'Vigilancia, Techado',
      ownerId: owner.id
    }
  });

  // Create sample bookings
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const booking1 = await prisma.booking.create({
    data: {
      userId: driver.id,
      parkingLotId: parkingLot1.id,
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000), // 3 hours
      duration: 180, // 3 hours in minutes
      totalPrice: 9000, // 3 hours * 3000 per hour
      status: 'PENDING',
      vehicleInfo: 'Toyota Corolla - ABC123',
      notes: 'Necesito espacio cerca de la entrada'
    }
  });

  const booking2 = await prisma.booking.create({
    data: {
      userId: driver.id,
      parkingLotId: parkingLot2.id,
      startTime: nextWeek,
      endTime: new Date(nextWeek.getTime() + 2 * 60 * 60 * 1000), // 2 hours
      duration: 120, // 2 hours in minutes
      totalPrice: 5000, // 2 hours * 2500 per hour
      status: 'CONFIRMED',
      vehicleInfo: 'Honda Civic - DEF456'
    }
  });

  console.log('✅ Database seeded successfully!');
  console.log('Sample users created:');
  console.log('- Driver:', driver.email, '(password: password123)');
  console.log('- Owner:', owner.email, '(password: password123)');
  console.log('Sample parking lots created:');
  console.log('- Parking Lot 1:', parkingLot1.name);
  console.log('- Parking Lot 2:', parkingLot2.name);
  console.log('Sample bookings created:');
  console.log('- Booking 1:', booking1.id, '- Status:', booking1.status);
  console.log('- Booking 2:', booking2.id, '- Status:', booking2.status);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
