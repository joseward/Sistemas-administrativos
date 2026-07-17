const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  try {
    await prisma.teacher.findFirst({
      where: {
        email: {
          equals: 'test@test.com',
          mode: 'insensitive'
        }
      }
    });
    console.log('success');
  } catch(e) {
    console.error(e.message);
  } finally {
    await prisma.$disconnect();
  }
}
run();
