import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedUsers() {
  console.log('🌱 Seeding users...');

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Admin/Owner Users
  const owners = [
    {
      name: 'Carlos Mendoza',
      email: 'carlos@parqueoapp.com',
      role: UserRole.OWNER,
      password: hashedPassword,
    },
    {
      name: 'Maria Rodriguez',
      email: 'maria.rodriguez@gmail.com',
      role: UserRole.OWNER,
      password: hashedPassword,
    },
    {
      name: 'Roberto Silva',
      email: 'roberto.silva@yahoo.com',
      role: UserRole.OWNER,
      password: hashedPassword,
    },
    {
      name: 'Ana Gutierrez',
      email: 'ana.gutierrez@hotmail.com',
      role: UserRole.OWNER,
      password: hashedPassword,
    },
    {
      name: 'Jose Martinez',
      email: 'jose.martinez@gmail.com',
      role: UserRole.OWNER,
      password: hashedPassword,
    },
  ];

  // Regular Driver Users
  const drivers = [
    {
      name: 'Juan Perez',
      email: 'juan.perez@gmail.com',
      role: UserRole.DRIVER,
      password: hashedPassword,
    },
    {
      name: 'Sofia Ramirez',
      email: 'sofia.ramirez@yahoo.com',
      role: UserRole.DRIVER,
      password: hashedPassword,
    },
    {
      name: 'Diego Morales',
      email: 'diego.morales@hotmail.com',
      role: UserRole.DRIVER,
      password: hashedPassword,
    },
    {
      name: 'Valentina Cruz',
      email: 'valentina.cruz@gmail.com',
      role: UserRole.DRIVER,
      password: hashedPassword,
    },
    {
      name: 'Mateo Fernandez',
      email: 'mateo.fernandez@outlook.com',
      role: UserRole.DRIVER,
      password: hashedPassword,
    },
    {
      name: 'Isabella Lopez',
      email: 'isabella.lopez@gmail.com',
      role: UserRole.DRIVER,
      password: hashedPassword,
    },
    {
      name: 'Sebastian Torres',
      email: 'sebastian.torres@yahoo.com',
      role: UserRole.DRIVER,
      password: hashedPassword,
    },
    {
      name: 'Camila Vargas',
      email: 'camila.vargas@hotmail.com',
      role: UserRole.DRIVER,
      password: hashedPassword,
    },
    {
      name: 'Nicolas Herrera',
      email: 'nicolas.herrera@gmail.com',
      role: UserRole.DRIVER,
      password: hashedPassword,
    },
    {
      name: 'Lucia Castillo',
      email: 'lucia.castillo@outlook.com',
      role: UserRole.DRIVER,
      password: hashedPassword,
    },
    {
      name: 'Daniel Jimenez',
      email: 'daniel.jimenez@yahoo.com',
      role: UserRole.DRIVER,
      password: hashedPassword,
    },
    {
      name: 'Gabriela Ruiz',
      email: 'gabriela.ruiz@gmail.com',
      role: UserRole.DRIVER,
      password: hashedPassword,
    },
    {
      name: 'Alejandro Medina',
      email: 'alejandro.medina@hotmail.com',
      role: UserRole.DRIVER,
      password: hashedPassword,
    },
    {
      name: 'Fernanda Ortiz',
      email: 'fernanda.ortiz@gmail.com',
      role: UserRole.DRIVER,
      password: hashedPassword,
    },
    {
      name: 'Ricardo Delgado',
      email: 'ricardo.delgado@yahoo.com',
      role: UserRole.DRIVER,
      password: hashedPassword,
    },
  ];

  try {
    // Create owners
    console.log('Creating owners...');
    const createdOwners = await Promise.all(
      owners.map(owner => 
        prisma.user.upsert({
          where: { email: owner.email },
          update: {},
          create: owner,
        })
      )
    );

    // Create drivers
    console.log('Creating drivers...');
    const createdDrivers = await Promise.all(
      drivers.map(driver => 
        prisma.user.upsert({
          where: { email: driver.email },
          update: {},
          create: driver,
        })
      )
    );

    console.log('✅ Users seeded successfully!');
    console.log(`Created ${createdOwners.length} owners and ${createdDrivers.length} drivers`);
    
    // Display summary
    console.log('\n📊 Users Summary:');
    console.log('=================');
    console.log('\n👥 OWNERS (Parking Lot Managers):');
    createdOwners.forEach((owner, index) => {
      console.log(`${index + 1}. ${owner.name} - ${owner.email}`);
    });
    
    console.log('\n🚗 DRIVERS (Regular Users):');
    createdDrivers.forEach((driver, index) => {
      console.log(`${index + 1}. ${driver.name} - ${driver.email}`);
    });
    
    console.log('\n🔐 Default Password for ALL users: password123');
    console.log('\n💡 Use these credentials to test the application');

  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedUsers()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
