import { PrismaClient, UserRole } from '@prisma/client';

const hashedPassword = 'password123'; // Reemplaza por el hash si es necesario

const owners = [
  {
    name: 'Admin Owner',
    email: 'admin.owner@parqueoapp.com',
    role: UserRole.OWNER,
    password: hashedPassword,
  }
];

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
  }
];

const prisma = new PrismaClient();

async function seedUsers() {
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
