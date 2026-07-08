const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const classrooms = ['CC1', 'CC2', 'B8', 'C4', 'B12', 'B10', 'B4', 'C11', 'B3', 'B1', 'C8', 'B9', 'B2', 'C7', 'C1', 'B11', 'B6', 'C9', 'C'];

async function main() {
  for (const name of classrooms) {
    await prisma.classroom.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('Seeded classrooms successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
