const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const group = await prisma.group.findUnique({ where: { id: 'mock-g1' } });
  console.log('Group mock-g1:', group);
}

check().catch(console.error).finally(() => prisma.$disconnect());
