import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function seedParkingLots() {
  console.log('🌱 Seeding parking lots...');

  // First, get all owners
  const owners = await prisma.user.findMany({
    where: { role: UserRole.OWNER },
    select: { id: true, name: true, email: true }
  });

  if (owners.length === 0) {
    console.log('❌ No owners found. Please run the user seeder first.');
    return;
  }

  // Parking lots data with realistic locations
  const parkingLots = [
    {
      name: 'Centro Comercial Plaza Norte',
      address: 'Av. Independencia 3902, Los Olivos, Lima',
      latitude: -11.9888,
      longitude: -77.0609,
      pricePerHour: 3.5,
      totalSpaces: 150,
      availableSpaces: 120,
      operatingHours: '06:00 - 23:00',
      amenities: 'Seguridad 24/7, Techado, Cámaras de vigilancia, Acceso para discapacitados',
      averageRating: 4.2,
      totalReviews: 48,
    },
    {
      name: 'Parqueo Miraflores Centro',
      address: 'Jr. de la Unión 1050, Miraflores, Lima',
      latitude: -12.1196,
      longitude: -77.0365,
      pricePerHour: 5.0,
      totalSpaces: 80,
      availableSpaces: 65,
      operatingHours: '24 horas',
      amenities: 'Valet parking, Lavado de autos, WiFi gratuito, Seguridad',
      averageRating: 4.5,
      totalReviews: 76,
    },
    {
      name: 'Estacionamiento San Isidro Business',
      address: 'Av. Javier Prado Este 1486, San Isidro, Lima',
      latitude: -12.0950,
      longitude: -77.0364,
      pricePerHour: 6.0,
      totalSpaces: 200,
      availableSpaces: 180,
      operatingHours: '05:00 - 24:00',
      amenities: 'Estacionamiento subterráneo, Ascensor, Seguridad biométrica',
      averageRating: 4.7,
      totalReviews: 92,
    },
    {
      name: 'Parqueo Barranco Artístico',
      address: 'Av. Grau 323, Barranco, Lima',
      latitude: -12.1406,
      longitude: -77.0214,
      pricePerHour: 4.0,
      totalSpaces: 60,
      availableSpaces: 45,
      operatingHours: '08:00 - 22:00',
      amenities: 'Cerca a museos, Iluminación LED, Vigilancia',
      averageRating: 4.0,
      totalReviews: 34,
    },
    {
      name: 'Mega Plaza Parqueo Norte',
      address: 'Av. Alfredo Mendiola 3698, Independencia, Lima',
      latitude: -12.0008,
      longitude: -77.0608,
      pricePerHour: 3.0,
      totalSpaces: 300,
      availableSpaces: 250,
      operatingHours: '06:00 - 23:00',
      amenities: 'Estacionamiento masivo, Shuttle al mall, Cobertura total',
      averageRating: 3.8,
      totalReviews: 123,
    },
    {
      name: 'Parqueo Corporativo La Molina',
      address: 'Av. Raúl Ferrero 1565, La Molina, Lima',
      latitude: -12.0769,
      longitude: -76.9422,
      pricePerHour: 4.5,
      totalSpaces: 120,
      availableSpaces: 100,
      operatingHours: '06:00 - 22:00',
      amenities: 'Estacionamiento empresarial, Reserva anticipada, Seguridad 24/7',
      averageRating: 4.3,
      totalReviews: 67,
    },
    {
      name: 'Parqueo Universitario PUCP',
      address: 'Av. Universitaria 1801, San Miguel, Lima',
      latitude: -12.0692,
      longitude: -77.0779,
      pricePerHour: 2.5,
      totalSpaces: 180,
      availableSpaces: 160,
      operatingHours: '06:00 - 23:00',
      amenities: 'Tarifas estudiantiles, Bicicletas permitidas, Áreas verdes',
      averageRating: 4.1,
      totalReviews: 89,
    },
    {
      name: 'Estacionamiento Callao Puerto',
      address: 'Av. Sáenz Peña 1205, Callao',
      latitude: -12.0565,
      longitude: -77.1181,
      pricePerHour: 3.5,
      totalSpaces: 90,
      availableSpaces: 75,
      operatingHours: '05:00 - 23:00',
      amenities: 'Cerca al puerto, Seguridad reforzada, Iluminación nocturna',
      averageRating: 3.9,
      totalReviews: 45,
    },
    {
      name: 'Parqueo Surco Residencial',
      address: 'Av. Benavides 2990, Surco, Lima',
      latitude: -12.1297,
      longitude: -77.0088,
      pricePerHour: 4.0,
      totalSpaces: 100,
      availableSpaces: 85,
      operatingHours: '24 horas',
      amenities: 'Zona residencial, Vigilancia nocturna, Fácil acceso',
      averageRating: 4.4,
      totalReviews: 56,
    },
    {
      name: 'Parqueo Aeropuerto Jorge Chávez',
      address: 'Av. Faucett s/n, Callao',
      latitude: -12.0219,
      longitude: -77.1143,
      pricePerHour: 8.0,
      totalSpaces: 500,
      availableSpaces: 420,
      operatingHours: '24 horas',
      amenities: 'Shuttle al aeropuerto, Seguridad máxima, Tarifas por día',
      averageRating: 4.6,
      totalReviews: 234,
    },
  ];

  try {
    // Create parking lots, distributing them among owners
    console.log('Creating parking lots...');
    const createdParkingLots = [];
    
    for (let i = 0; i < parkingLots.length; i++) {
      const parkingLot = parkingLots[i];
      const owner = owners[i % owners.length]; // Distribute evenly among owners
      
      const created = await prisma.parkingLot.create({
        data: {
          ...parkingLot,
          ownerId: owner.id,
        },
      });
      
      createdParkingLots.push({
        ...created,
        ownerName: owner.name,
        ownerEmail: owner.email,
      });
    }

    console.log('✅ Parking lots seeded successfully!');
    console.log(`Created ${createdParkingLots.length} parking lots`);
    
    // Display summary
    console.log('\n📊 Parking Lots Summary:');
    console.log('========================');
    
    createdParkingLots.forEach((lot, index) => {
      console.log(`\n${index + 1}. ${lot.name}`);
      console.log(`   📍 ${lot.address}`);
      console.log(`   👤 Owner: ${lot.ownerName} (${lot.ownerEmail})`);
      console.log(`   💰 Price: S/ ${lot.pricePerHour}/hour`);
      console.log(`   🅿️  Spaces: ${lot.availableSpaces}/${lot.totalSpaces}`);
      console.log(`   ⭐ Rating: ${lot.averageRating}/5 (${lot.totalReviews} reviews)`);
      console.log(`   🕐 Hours: ${lot.operatingHours}`);
    });
    
    console.log('\n💡 These parking lots are now available for booking!');

  } catch (error) {
    console.error('Error seeding parking lots:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedParkingLots()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
