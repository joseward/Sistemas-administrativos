import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding catalogs...');

  const years = [
    { value: '2025-2026' },
    { value: '2026-2027' },
    { value: '2027-2028' }
  ];

  for (const y of years) {
    await prisma.academicYear.upsert({
      where: { value: y.value },
      update: {},
      create: y
    });
  }

  const bimestres = [
    { value: 1, label: 'Módulo 1' },
    { value: 2, label: 'Módulo 2' },
    { value: 3, label: 'Módulo 3' },
    { value: 4, label: 'Módulo 4' },
    { value: 5, label: 'Módulo 5' },
    { value: 6, label: 'Módulo 6' }
  ];

  for (const b of bimestres) {
    await prisma.bimestre.upsert({
      where: { value: b.value },
      update: { label: b.label },
      create: b
    });
  }

  const cuatrimestres = [
    { value: 1, label: '1er Cuatrimestre (Ene-Abr)' },
    { value: 2, label: '2do Cuatrimestre (May-Ago)' },
    { value: 3, label: '3er Cuatrimestre (Sep-Dic)' },
    { value: 4, label: '4to Cuatrimestre' },
    { value: 5, label: '5to Cuatrimestre' },
    { value: 6, label: '6to Cuatrimestre' }
  ];

  for (const c of cuatrimestres) {
    await prisma.cuatrimestre.upsert({
      where: { value: c.value },
      update: { label: c.label },
      create: c
    });
  }

  console.log('Seeding catalogs completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
