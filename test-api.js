const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const teacher = await prisma.teacher.findFirst();
    if (!teacher) {
      console.log('No teachers found');
      return;
    }
    console.log('Teacher:', teacher.firstName, teacher.lastName, teacher.id);

    const subjects = await prisma.subject.findMany();
    console.log('Subjects in DB:', subjects.length);
    if (subjects.length > 0) {
      console.log('First subject:', subjects[0].name, subjects[0].id);
    } else {
        console.log('No subjects in DB!');
        return;
    }

    const mockGroup = await prisma.group.findUnique({ where: { id: 'mock-g1' } });
    console.log('Mock group exists:', !!mockGroup);

    // Let's try to insert two assignments for the same subject
    const assignments = [
      {
        teacherId: teacher.id,
        subjectId: subjects[0].id,
        groupId: 'mock-g1',
        scheduleDay: 1,
        startTime: '07:00',
        endTime: '08:20',
        academicYear: '2026-2027',
        modulo: 1,
        cuatrimestre: 1,
        isAvailable: true
      },
      {
        teacherId: teacher.id,
        subjectId: subjects[0].id,
        groupId: 'mock-g1',
        scheduleDay: 2, // Tuesday
        startTime: '07:00',
        endTime: '08:20',
        academicYear: '2026-2027',
        modulo: 1,
        cuatrimestre: 1,
        isAvailable: true
      }
    ];

    await prisma.$transaction(async (tx) => {
      await tx.teacherSubjectGroup.deleteMany({
        where: { teacherId: teacher.id }
      });
      await tx.teacherSubjectGroup.createMany({
        data: assignments
      });
    });
    console.log('Transaction succeeded!');

  } catch (err) {
    console.error('Prisma Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
