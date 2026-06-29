const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const teacherId = "cm0gxj5q0000008lc6p0z0v9x"; // We need a real teacher ID. Let's find one.
    const teacher = await prisma.teacher.findFirst();
    if (!teacher) {
      console.log('No teachers found');
      return;
    }
    console.log('Using teacher:', teacher.id);
    
    // Simulate the exact code from route.ts
    await prisma.$transaction(async (tx) => {
      const mockGroup = await tx.group.findUnique({ where: { id: 'mock-g1' } });
      if (!mockGroup) {
        const school = await tx.school.findFirst();
        if (school) {
          await tx.group.create({
            data: {
              id: 'mock-g1',
              schoolId: school.id,
              name: 'Grupo Principal (Defecto)',
              grade: 1,
              academicYear: '2026-2027'
            }
          });
          console.log('Created mock-g1 group');
        }
      }

      await tx.teacherSubjectGroup.deleteMany({
        where: { teacherId: teacher.id }
      });
      console.log('Deleted old assignments');

      const subject = await tx.subject.findFirst();
      if (!subject) {
          console.log('No subject found');
          return;
      }

      const assignments = [
        {
          subjectId: subject.id,
          groupId: 'mock-g1',
          scheduleDay: 1,
          startTime: '07:00',
          endTime: '08:20',
          academicYear: '2026-2027',
          modulo: 1,
          cuatrimestre: 1,
          isAvailable: true
        }
      ];

      await tx.teacherSubjectGroup.createMany({
        data: assignments.map((a) => ({
          teacherId: teacher.id,
          subjectId: a.subjectId,
          groupId: a.groupId,
          scheduleDay: a.scheduleDay,
          startTime: a.startTime,
          endTime: a.endTime,
          academicYear: a.academicYear || '2026-2027',
          modulo: a.modulo,
          cuatrimestre: a.cuatrimestre,
          isAvailable: a.isAvailable
        }))
      });
      console.log('Created new assignments successfully');
    });
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
