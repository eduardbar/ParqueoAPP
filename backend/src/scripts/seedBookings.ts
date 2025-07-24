import { PrismaClient, UserRole, BookingStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedBookings() {
  console.log('🌱 Seeding sample bookings...');

  // Get users and parking lots
  const drivers = await prisma.user.findMany({
    where: { role: UserRole.DRIVER },
    take: 10,
  });

  const parkingLots = await prisma.parkingLot.findMany({
    take: 10,
  });

  if (drivers.length === 0 || parkingLots.length === 0) {
    console.log('❌ No drivers or parking lots found. Please run the other seeders first.');
    return;
  }

  // Sample bookings data
  const bookings = [
    {
      userId: drivers[0].id,
      parkingLotId: parkingLots[0].id,
      startTime: new Date('2024-07-16T08:00:00'),
      endTime: new Date('2024-07-16T12:00:00'),
      duration: 240,
      totalPrice: 14.0,
      status: BookingStatus.COMPLETED,
      vehicleInfo: 'Toyota Corolla - ABC-123',
      notes: 'Espacios cerca del ascensor por favor',
    },
    {
      userId: drivers[1].id,
      parkingLotId: parkingLots[1].id,
      startTime: new Date('2024-07-16T14:00:00'),
      endTime: new Date('2024-07-16T18:00:00'),
      duration: 240,
      totalPrice: 20.0,
      status: BookingStatus.PAID,
      vehicleInfo: 'Honda Civic - XYZ-456',
      notes: 'Primera vez en este estacionamiento',
      paymentCompletedAt: new Date('2024-07-16T13:45:00'),
    },
    {
      userId: drivers[2].id,
      parkingLotId: parkingLots[2].id,
      startTime: new Date('2024-07-16T09:00:00'),
      endTime: new Date('2024-07-16T17:00:00'),
      duration: 480,
      totalPrice: 48.0,
      status: BookingStatus.ACTIVE,
      vehicleInfo: 'Nissan Sentra - DEF-789',
      notes: 'Trabajo en el edificio de al lado',
    },
    {
      userId: drivers[3].id,
      parkingLotId: parkingLots[3].id,
      startTime: new Date('2024-07-16T19:00:00'),
      endTime: new Date('2024-07-16T23:00:00'),
      duration: 240,
      totalPrice: 16.0,
      status: BookingStatus.CONFIRMED,
      vehicleInfo: 'Hyundai Accent - GHI-012',
      notes: 'Cena en Barranco',
    },
    {
      userId: drivers[4].id,
      parkingLotId: parkingLots[4].id,
      startTime: new Date('2024-07-17T10:00:00'),
      endTime: new Date('2024-07-17T14:00:00'),
      duration: 240,
      totalPrice: 12.0,
      status: BookingStatus.PENDING,
      vehicleInfo: 'Kia Rio - JKL-345',
      notes: 'Compras en el mall',
    },
    {
      userId: drivers[5].id,
      parkingLotId: parkingLots[5].id,
      startTime: new Date('2024-07-17T08:30:00'),
      endTime: new Date('2024-07-17T17:30:00'),
      duration: 540,
      totalPrice: 40.5,
      status: BookingStatus.PAID,
      vehicleInfo: 'Chevrolet Spark - MNO-678',
      notes: 'Día completo de trabajo',
      paymentCompletedAt: new Date('2024-07-17T08:15:00'),
    },
    {
      userId: drivers[6].id,
      parkingLotId: parkingLots[6].id,
      startTime: new Date('2024-07-15T07:00:00'),
      endTime: new Date('2024-07-15T15:00:00'),
      duration: 480,
      totalPrice: 20.0,
      status: BookingStatus.COMPLETED,
      vehicleInfo: 'Volkswagen Polo - PQR-901',
      notes: 'Clases en la universidad',
    },
    {
      userId: drivers[7].id,
      parkingLotId: parkingLots[7].id,
      startTime: new Date('2024-07-17T15:00:00'),
      endTime: new Date('2024-07-17T20:00:00'),
      duration: 300,
      totalPrice: 17.5,
      status: BookingStatus.CANCELLED,
      vehicleInfo: 'Mazda 3 - STU-234',
      notes: 'Cambio de planes',
    },
    {
      userId: drivers[8].id,
      parkingLotId: parkingLots[8].id,
      startTime: new Date('2024-07-16T20:00:00'),
      endTime: new Date('2024-07-17T08:00:00'),
      duration: 720,
      totalPrice: 48.0,
      status: BookingStatus.PAID,
      vehicleInfo: 'Ford Fiesta - VWX-567',
      notes: 'Estacionamiento nocturno',
      paymentCompletedAt: new Date('2024-07-16T19:30:00'),
    },
    {
      userId: drivers[9].id,
      parkingLotId: parkingLots[9].id,
      startTime: new Date('2024-07-18T05:00:00'),
      endTime: new Date('2024-07-18T09:00:00'),
      duration: 240,
      totalPrice: 32.0,
      status: BookingStatus.CONFIRMED,
      vehicleInfo: 'Renault Logan - YZA-890',
      notes: 'Vuelo temprano',
    },
  ];

  try {
    console.log('Creating sample bookings...');
    const createdBookings = await Promise.all(
      bookings.map(booking => 
        prisma.booking.create({
          data: booking,
          include: {
            user: { select: { name: true, email: true } },
            parkingLot: { select: { name: true, address: true } },
          },
        })
      )
    );

    console.log('✅ Sample bookings created successfully!');
    console.log(`Created ${createdBookings.length} bookings`);
    
    // Display summary
    console.log('\n📊 Bookings Summary:');
    console.log('===================');
    
    // createdBookings.forEach((booking, index) => {
    //   ...
    // });
    
    console.log('\n💡 These bookings provide realistic test scenarios!');

  } catch (error) {
    console.error('Error seeding bookings:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedBookings()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
