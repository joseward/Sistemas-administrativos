const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const teachers = await prisma.teacher.findMany();
  const users = await prisma.user.findMany();
  console.log(JSON.stringify({teachers, users}, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
