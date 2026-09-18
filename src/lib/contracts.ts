import prisma from '@/lib/prisma';

export const DEFAULT_CONTRACT_CONFIG = {
  cuatrimestre: '2DO CUATRIMESTRE (MAY-AGO)',
  mod1Title: 'MÓDULO 1',
  mod1Start: '05, 06 Y 07 DE MAYO - ENTRE SEMANA\n09 DE MAYO - SÁBADOS\n10 DE MAYO - DOMINGOS',
  mod1End: '23, 24 Y 25 DE JUNIO - ENTRE SEMANA\n27 DE JUNIO - SÁBADOS\n28 DE JUNIO - DOMINGOS',
  mod2Title: 'MÓDULO 2',
  mod2Start: '30 DE JUNIO, 01 Y 02 DE JULIO - ENTRE SEMANA\n04 DE JULIO - SÁBADOS\n05 DE JULIO - DOMINGOS',
  mod2End: '18, 19 Y 20 DE AGOSTO - ENTRE SEMANA\n22 DE AGOSTO - SÁBADOS\n23 DE AGOSTO - DOMINGOS'
};

/**
 * Obtiene la configuración de contrato más reciente para un ciclo escolar,
 * heredando los textos que el administrador haya guardado previamente.
 */
export async function getLatestContractConfig(academicYear?: string) {
  try {
    const existing = await prisma.contract.findFirst({
      where: academicYear ? { academicYear } : undefined,
      orderBy: { updatedAt: 'desc' },
      select: {
        cuatrimestre: true,
        mod1Title: true,
        mod1Start: true,
        mod1End: true,
        mod2Title: true,
        mod2Start: true,
        mod2End: true,
      }
    });

    if (existing) {
      return {
        cuatrimestre: existing.cuatrimestre || DEFAULT_CONTRACT_CONFIG.cuatrimestre,
        mod1Title: existing.mod1Title || DEFAULT_CONTRACT_CONFIG.mod1Title,
        mod1Start: existing.mod1Start || DEFAULT_CONTRACT_CONFIG.mod1Start,
        mod1End: existing.mod1End || DEFAULT_CONTRACT_CONFIG.mod1End,
        mod2Title: existing.mod2Title || DEFAULT_CONTRACT_CONFIG.mod2Title,
        mod2Start: existing.mod2Start || DEFAULT_CONTRACT_CONFIG.mod2Start,
        mod2End: existing.mod2End || DEFAULT_CONTRACT_CONFIG.mod2End,
      };
    }
  } catch (err) {
    console.error('Error fetching latest contract config:', err);
  }

  return { ...DEFAULT_CONTRACT_CONFIG };
}

/**
 * Asegura que exista un contrato (Anexo I) para un docente en un ciclo escolar.
 * Si no existe, lo crea automáticamente heredando las fechas/textos configurados.
 */
export async function ensureContractForTeacher(teacherId: string, academicYear?: string) {
  if (!teacherId) return null;

  try {
    // Resolver ciclo escolar si no fue provisto
    let year = academicYear;
    if (!year) {
      const activeYear = await prisma.academicYear.findFirst({
        where: { isActive: true },
        orderBy: { value: 'desc' }
      });
      year = activeYear ? activeYear.value : '2026-2027';
    }

    // Comprobar si ya existe
    const existing = await prisma.contract.findFirst({
      where: { teacherId, academicYear: year }
    });

    if (existing) {
      return existing;
    }

    // Obtener datos del maestro (schoolId)
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      select: { id: true, schoolId: true }
    });

    if (!teacher) return null;

    // Obtener la configuración o textos más recientes
    const config = await getLatestContractConfig(year);

    return await prisma.contract.create({
      data: {
        teacherId,
        schoolId: teacher.schoolId,
        academicYear: year,
        contractType: 'hourly',
        cuatrimestre: config.cuatrimestre,
        mod1Title: config.mod1Title,
        mod1Start: config.mod1Start,
        mod1End: config.mod1End,
        mod2Title: config.mod2Title,
        mod2Start: config.mod2Start,
        mod2End: config.mod2End,
      }
    });
  } catch (err) {
    console.error(`Error ensuring contract for teacher ${teacherId}:`, err);
    return null;
  }
}

/**
 * Aplica una configuración de fechas/textos a TODOS los maestros,
 * actualizando los existentes y creando los que falten.
 */
export async function upsertContractsForAllTeachers(academicYear: string, configData: any) {
  const teachers = await prisma.teacher.findMany({
    select: { id: true, schoolId: true }
  });

  const results = [];
  for (const t of teachers) {
    const existing = await prisma.contract.findFirst({
      where: { teacherId: t.id, academicYear }
    });

    if (existing) {
      const updated = await prisma.contract.update({
        where: { id: existing.id },
        data: configData
      });
      results.push(updated);
    } else {
      const created = await prisma.contract.create({
        data: {
          teacherId: t.id,
          schoolId: t.schoolId,
          academicYear,
          contractType: 'hourly',
          ...configData
        }
      });
      results.push(created);
    }
  }

  return results;
}
