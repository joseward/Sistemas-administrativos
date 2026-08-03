export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

async function getUserId(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      return payload.id as string;
    } catch (e) {
      return undefined;
    }
  }
  return undefined;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { teacherId } = await request.json();

    const updateData = { schedulesPublishedAt: new Date() };
    const teachersToProcess: string[] = [];

    if (teacherId) {
      // Publicar para un solo maestro
      await prisma.teacher.update({
        where: { id: teacherId },
        data: updateData
      });
      teachersToProcess.push(teacherId);
    } else {
      // Publicar para todos
      await prisma.teacher.updateMany({
        data: updateData
      });
      const allTeachers = await prisma.teacher.findMany({ select: { id: true } });
      teachersToProcess.push(...allTeachers.map(t => t.id));
    }

    // Generar contratos (Anexo I) vacíos o por defecto para cada maestro publicado
    const activeYear = await prisma.academicYear.findFirst({ where: { isActive: true } });
    if (activeYear) {
      for (const tId of teachersToProcess) {
        const existingContract = await prisma.contract.findFirst({
          where: { teacherId: tId, academicYear: activeYear.value }
        });
        
        if (!existingContract) {
          await prisma.contract.create({
            data: {
              teacherId: tId,
              academicYear: activeYear.value,
              contractType: 'hourly',
              cuatrimestre: 'CUATRIMESTRE MAYO - AGOSTO',
              mod1Title: 'PRIMER MÓDULO',
              mod1Start: '05, 06 Y 07 DE MAYO - ENTRE SEMANA\n09 DE MAYO - SÁBADOS\n10 DE MAYO - DOMINGOS',
              mod1End: '23, 24 Y 25 DE JUNIO - ENTRE SEMANA\n27 DE JUNIO - SÁBADOS\n28 DE JUNIO - DOMINGOS',
              mod2Title: 'SEGUNDO MÓDULO',
              mod2Start: '30 DE JUNIO, 01 Y 02 DE JULIO - ENTRE SEMANA\n04 DE JULIO - SÁBADOS\n05 DE JULIO - DOMINGOS',
              mod2End: '18, 19 Y 20 DE AGOSTO - ENTRE SEMANA\n22 DE AGOSTO - SÁBADOS\n23 DE AGOSTO - DOMINGOS'
            }
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error publishing schedules:', error);
    return NextResponse.json({ error: 'Error al publicar los horarios' }, { status: 500 });
  }
}
