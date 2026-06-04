import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de base de datos...\n');

  try {
    // Verificar conexión
    await prisma.$executeRaw`SELECT 1`;
    console.log('✓ Conexión a BD establecida\n');
  } catch (error) {
    console.error('❌ Error de conexión a BD:', error);
    process.exit(1);
  }

  // 1. Crear Escuela
  console.log('📚 Creando escuela...');
  const school = await prisma.school.create({
    data: {
      name: 'Instituto Técnico Administrativo "San Martín"',
      email: 'info@institutotech.edu',
      phone: '+1-555-0100',
      address: 'Avenida Principal 123, San José, Costa Rica',
    },
  });
  console.log(`   ✓ Escuela: ${school.name}\n`);

  // 2. Crear Maestros (3 maestros)
  console.log('👨‍🏫 Creando maestros...');
  const teachers = await Promise.all([
    prisma.teacher.create({
      data: {
        schoolId: school.id,
        firstName: 'Juan',
        lastName: 'Pérez García',
        email: 'juan.perez@institutotech.edu',
        phone: '+506-8765-4321',
        cedula: '1-2345-6789',
        specialization: 'Matemáticas y Cálculo',
        contractStatus: 'active',
      },
    }),
    prisma.teacher.create({
      data: {
        schoolId: school.id,
        firstName: 'María',
        lastName: 'López Martínez',
        email: 'maria.lopez@institutotech.edu',
        phone: '+506-8765-4322',
        cedula: '1-9876-5432',
        specialization: 'Lenguaje y Literatura',
        contractStatus: 'active',
      },
    }),
    prisma.teacher.create({
      data: {
        schoolId: school.id,
        firstName: 'Carlos',
        lastName: 'Rodríguez Silva',
        email: 'carlos.rodriguez@institutotech.edu',
        phone: '+506-8765-4323',
        cedula: '1-1122-3344',
        specialization: 'Ciencias Sociales y Geografía',
        contractStatus: 'active',
      },
    }),
  ]);
  console.log(`   ✓ ${teachers.length} maestros creados\n`);

  // 3. Crear Materias (3 materias)
  console.log('📖 Creando materias...');
  const subjects = await Promise.all([
    prisma.subject.create({
      data: {
        schoolId: school.id,
        name: 'Matemáticas',
        code: 'MAT-101',
        description: 'Álgebra, Geometría y Cálculo Diferencial',
        credits: 4,
      },
    }),
    prisma.subject.create({
      data: {
        schoolId: school.id,
        name: 'Lenguaje y Literatura',
        code: 'LENG-101',
        description: 'Español, Gramática y Literatura Hispanoamericana',
        credits: 3,
      },
    }),
    prisma.subject.create({
      data: {
        schoolId: school.id,
        name: 'Estudios Sociales',
        code: 'CCSS-101',
        description: 'Historia, Geografía, Cívica y Cultura',
        credits: 3,
      },
    }),
  ]);
  console.log(`   ✓ ${subjects.length} materias creadas\n`);

  // 4. Crear Grupos (2 grupos)
  console.log('👥 Creando grupos académicos...');
  const groups = await Promise.all([
    prisma.group.create({
      data: {
        schoolId: school.id,
        name: '10-A',
        grade: 10,
        section: 'A',
        totalStudents: 32,
        academicYear: '2025-2026',
      },
    }),
    prisma.group.create({
      data: {
        schoolId: school.id,
        name: '11-A',
        grade: 11,
        section: 'A',
        totalStudents: 28,
        academicYear: '2025-2026',
      },
    }),
  ]);
  console.log(`   ✓ ${groups.length} grupos creados\n`);

  // 5. Crear Estudiantes (5 estudiantes distribuidos)
  console.log('🎓 Creando estudiantes...');
  const students = await Promise.all([
    prisma.student.create({
      data: {
        schoolId: school.id,
        groupId: groups[0].id,
        firstName: 'Pedro',
        lastName: 'Gutiérrez López',
        registrationNumber: 'EST-2025-001',
        dateOfBirth: new Date('2009-03-15'),
        email: 'pedro.gutierrez@estudiantes.edu',
      },
    }),
    prisma.student.create({
      data: {
        schoolId: school.id,
        groupId: groups[0].id,
        firstName: 'Ana',
        lastName: 'García Fernández',
        registrationNumber: 'EST-2025-002',
        dateOfBirth: new Date('2009-07-22'),
        email: 'ana.garcia@estudiantes.edu',
      },
    }),
    prisma.student.create({
      data: {
        schoolId: school.id,
        groupId: groups[0].id,
        firstName: 'Luis',
        lastName: 'Martínez Ruiz',
        registrationNumber: 'EST-2025-003',
        dateOfBirth: new Date('2009-11-10'),
        email: 'luis.martinez@estudiantes.edu',
      },
    }),
    prisma.student.create({
      data: {
        schoolId: school.id,
        groupId: groups[1].id,
        firstName: 'Sofia',
        lastName: 'Hernández Castro',
        registrationNumber: 'EST-2025-004',
        dateOfBirth: new Date('2008-05-18'),
        email: 'sofia.hernandez@estudiantes.edu',
      },
    }),
    prisma.student.create({
      data: {
        schoolId: school.id,
        groupId: groups[1].id,
        firstName: 'Diego',
        lastName: 'Vargas Mendoza',
        registrationNumber: 'EST-2025-005',
        dateOfBirth: new Date('2008-09-02'),
        email: 'diego.vargas@estudiantes.edu',
      },
    }),
  ]);
  console.log(`   ✓ ${students.length} estudiantes creados\n`);

  // 6. Crear Disponibilidad de Maestros
  console.log('⏰ Configurando disponibilidades de maestros...');
  await Promise.all([
    // Juan - Lunes y Miércoles (Matemáticas)
    prisma.teacherAvailability.create({
      data: {
        teacherId: teachers[0].id,
        dayOfWeek: 0, // Lunes
        startTime: new Date('2025-01-01T07:00:00'),
        endTime: new Date('2025-01-01T13:00:00'),
        isAvailable: true,
      },
    }),
    prisma.teacherAvailability.create({
      data: {
        teacherId: teachers[0].id,
        dayOfWeek: 2, // Miércoles
        startTime: new Date('2025-01-01T07:00:00'),
        endTime: new Date('2025-01-01T13:00:00'),
        isAvailable: true,
      },
    }),
    // María - Martes y Jueves (Lenguaje)
    prisma.teacherAvailability.create({
      data: {
        teacherId: teachers[1].id,
        dayOfWeek: 1, // Martes
        startTime: new Date('2025-01-01T07:00:00'),
        endTime: new Date('2025-01-01T13:00:00'),
        isAvailable: true,
      },
    }),
    prisma.teacherAvailability.create({
      data: {
        teacherId: teachers[1].id,
        dayOfWeek: 3, // Jueves
        startTime: new Date('2025-01-01T07:00:00'),
        endTime: new Date('2025-01-01T13:00:00'),
        isAvailable: true,
      },
    }),
    // Carlos - Lunes, Miércoles y Viernes (Estudios Sociales)
    prisma.teacherAvailability.create({
      data: {
        teacherId: teachers[2].id,
        dayOfWeek: 0, // Lunes
        startTime: new Date('2025-01-01T13:00:00'),
        endTime: new Date('2025-01-01T17:30:00'),
        isAvailable: true,
      },
    }),
    prisma.teacherAvailability.create({
      data: {
        teacherId: teachers[2].id,
        dayOfWeek: 2, // Miércoles
        startTime: new Date('2025-01-01T13:00:00'),
        endTime: new Date('2025-01-01T17:30:00'),
        isAvailable: true,
      },
    }),
    prisma.teacherAvailability.create({
      data: {
        teacherId: teachers[2].id,
        dayOfWeek: 4, // Viernes
        startTime: new Date('2025-01-01T13:00:00'),
        endTime: new Date('2025-01-01T17:30:00'),
        isAvailable: true,
      },
    }),
  ]);
  console.log('   ✓ Disponibilidades configuradas\n');

  // 7. Crear Asignaciones (Maestro - Materia - Grupo)
  console.log('📚 Creando asignaciones de clases...');
  const assignments = await Promise.all([
    // Juan: Matemáticas en 10-A (Lunes 7:00-8:30)
    prisma.teacherSubjectGroup.create({
      data: {
        teacherId: teachers[0].id,
        subjectId: subjects[0].id,
        groupId: groups[0].id,
        scheduleDay: 0,
        startTime: new Date('2025-01-01T07:00:00'),
        endTime: new Date('2025-01-01T08:30:00'),
        classroom: 'Aula 101',
        academicYear: '2025-2026',
      },
    }),
    // María: Lenguaje en 10-A (Martes 8:30-10:00)
    prisma.teacherSubjectGroup.create({
      data: {
        teacherId: teachers[1].id,
        subjectId: subjects[1].id,
        groupId: groups[0].id,
        scheduleDay: 1,
        startTime: new Date('2025-01-01T08:30:00'),
        endTime: new Date('2025-01-01T10:00:00'),
        classroom: 'Aula 102',
        academicYear: '2025-2026',
      },
    }),
    // Carlos: Estudios Sociales en 11-A (Miércoles 13:00-14:30)
    prisma.teacherSubjectGroup.create({
      data: {
        teacherId: teachers[2].id,
        subjectId: subjects[2].id,
        groupId: groups[1].id,
        scheduleDay: 2,
        startTime: new Date('2025-01-01T13:00:00'),
        endTime: new Date('2025-01-01T14:30:00'),
        classroom: 'Aula 103',
        academicYear: '2025-2026',
      },
    }),
    // Juan: Matemáticas en 11-A (Viernes 9:00-10:30)
    prisma.teacherSubjectGroup.create({
      data: {
        teacherId: teachers[0].id,
        subjectId: subjects[0].id,
        groupId: groups[1].id,
        scheduleDay: 4,
        startTime: new Date('2025-01-01T09:00:00'),
        endTime: new Date('2025-01-01T10:30:00'),
        classroom: 'Aula 101',
        academicYear: '2025-2026',
      },
    }),
  ]);
  console.log(`   ✓ ${assignments.length} asignaciones creadas\n`);

  // 8. Crear Contratos
  console.log('📋 Creando contratos...');
  await Promise.all([
    prisma.contract.create({
      data: {
        schoolId: school.id,
        teacherId: teachers[0].id,
        academicYear: '2025-2026',
        contractType: 'full-time',
        startDate: new Date('2025-01-20'),
        endDate: new Date('2025-12-15'),
        salary: new Decimal('18500.00'),
        isSigned: false,
      },
    }),
    prisma.contract.create({
      data: {
        schoolId: school.id,
        teacherId: teachers[1].id,
        academicYear: '2025-2026',
        contractType: 'full-time',
        startDate: new Date('2025-01-20'),
        endDate: new Date('2025-12-15'),
        salary: new Decimal('17200.00'),
        isSigned: false,
      },
    }),
    prisma.contract.create({
      data: {
        schoolId: school.id,
        teacherId: teachers[2].id,
        academicYear: '2025-2026',
        contractType: 'part-time',
        startDate: new Date('2025-01-20'),
        endDate: new Date('2025-12-15'),
        salary: new Decimal('9500.00'),
        isSigned: false,
      },
    }),
  ]);
  console.log('   ✓ Contratos creados\n');

  // 9. Crear Registros de Asistencia
  console.log('✅ Creando registros de asistencia...');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await Promise.all([
    // Asistencia grupo 10-A, clase Juan (Matemáticas)
    prisma.attendance.create({
      data: {
        teacherSubjectGroupId: assignments[0].id,
        studentId: students[0].id,
        sessionDate: today,
        status: 'present',
      },
    }),
    prisma.attendance.create({
      data: {
        teacherSubjectGroupId: assignments[0].id,
        studentId: students[1].id,
        sessionDate: today,
        status: 'present',
      },
    }),
    prisma.attendance.create({
      data: {
        teacherSubjectGroupId: assignments[0].id,
        studentId: students[2].id,
        sessionDate: today,
        status: 'late',
        notes: 'Llegó 10 minutos tarde por razones de transporte',
      },
    }),
    // Asistencia grupo 11-A, clase Carlos (Estudios Sociales)
    prisma.attendance.create({
      data: {
        teacherSubjectGroupId: assignments[2].id,
        studentId: students[3].id,
        sessionDate: today,
        status: 'present',
      },
    }),
    prisma.attendance.create({
      data: {
        teacherSubjectGroupId: assignments[2].id,
        studentId: students[4].id,
        sessionDate: today,
        status: 'absent',
        notes: 'Ausencia justificada - cita médica',
      },
    }),
  ]);
  console.log('   ✓ Registros de asistencia creados\n');

  console.log('═'.repeat(50));
  console.log('\n✅ SEED COMPLETADO EXITOSAMENTE\n');
  console.log('Resumen de datos cargados:');
  console.log(`  • Escuela: ${school.name}`);
  console.log(`  • Maestros: ${teachers.length}`);
  console.log(`  • Materias: ${subjects.length}`);
  console.log(`  • Grupos: ${groups.length}`);
  console.log(`  • Estudiantes: ${students.length}`);
  console.log(`  • Asignaciones: ${assignments.length}`);
  console.log(`  • Contratos: 3`);
  console.log(`  • Registros de asistencia: 5`);
  console.log('\n' + '═'.repeat(50));
}

main()
  .catch((e) => {
    console.error('\n❌ ERROR DURANTE EL SEED:\n', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
