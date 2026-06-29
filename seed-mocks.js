const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MOCK_SUBJECTS = [
  { id: 'subj-1', name: 'Matemáticas' },
  { id: 'subj-2', name: 'Ciencias Naturales' },
  { id: 'subj-3', name: 'Historia y Geografía' },
  { id: 'subj-4', name: 'Español' },
  { id: 'subj-5', name: 'Inglés Básico' },
  { id: 'subj-6', name: 'Educación Física' },
  { id: 'subj-7', name: 'Derecho Civil I' },
  { id: 'subj-8', name: 'Contabilidad General' },
  { id: 'subj-9', name: 'Formación de Emprendedores' },
  { id: 'subj-10', name: 'Seminario de Finanzas' },
];

async function seed() {
  try {
    const school = await prisma.school.findFirst();
    if (!school) {
      console.log('No school found');
      return;
    }
    
    for (const subj of MOCK_SUBJECTS) {
      const existing = await prisma.subject.findUnique({ where: { id: subj.id } });
      if (!existing) {
        await prisma.subject.create({
          data: {
            id: subj.id,
            schoolId: school.id,
            name: subj.name,
            code: subj.id,
          }
        });
        console.log(`Created subject ${subj.name}`);
      } else {
        console.log(`Subject ${subj.name} already exists`);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
