import { PrismaClient } from '@prisma/client';

// Global variable to hold the Prisma instance
let prisma: PrismaClient;

// Function to get or create Prisma client
export const getPrismaClient = () => {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }
  return prisma;
};

// Function to disconnect Prisma client
export const disconnectPrisma = async () => {
  if (prisma) {
    await prisma.$disconnect();
  }
};

export default getPrismaClient;
