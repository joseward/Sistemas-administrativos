const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const teachers = await prisma.teacher.findMany({ select: { email: true, firstName: true } });
  const users = await prisma.user.findMany({ where: { role: 'docente' }, select: { email: true, firstName: true } });
  console.log('Teachers:', teachers);
  console.log('Users:', users);
}

main().catch(console.error).finally(() => prisma.$disconnect());
