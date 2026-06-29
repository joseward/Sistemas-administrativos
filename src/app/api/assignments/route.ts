import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from 'jose';
import { MOCK_SUBJECTS } from '@/lib/mockData';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// GET: Obtener todas las asignaciones o filtrar por teacherId
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const teacherId = searchParams.get('teacherId');

    const assignments = await prisma.teacherSubjectGroup.findMany({
      where: teacherId ? { teacherId } : undefined,
      include: {
        teacher: true,
      },
    });

    return NextResponse.json({ success: true, data: assignments });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener asignaciones' }, { status: 500 });
  }
}

// POST: Sincronizar (Reemplazar) las asignaciones de un maestro
export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticación (puede ser el admin guardando desde el panel, o el docente)
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    
    const body = await request.json();
    const { teacherId, assignments } = body; // assignments es un array

    if (!teacherId) {
      return NextResponse.json({ success: false, error: 'Se requiere teacherId' }, { status: 400 });
    }

    // 2. Seguridad: Si es docente, solo puede modificar sus propias asignaciones
    if (payload.role === 'docente') {
      // Necesitamos buscar el Teacher usando el email del token
      const teacher = await prisma.teacher.findUnique({
        where: { email: payload.email as string }
      });
      if (!teacher || teacher.id !== teacherId) {
        return NextResponse.json({ success: false, error: 'No tienes permiso para modificar a este maestro' }, { status: 403 });
      }
    }

    // 3. Ejecutar en transacción: Eliminar las anteriores y crear las nuevas
    await prisma.$transaction(async (tx) => {
      // Asegurar que el grupo y las materias mock existan
      const school = await tx.school.findFirst();
      if (school) {
        const mockGroup = await tx.group.findUnique({ where: { id: 'mock-g1' } });
        if (!mockGroup) {
          await tx.group.create({
            data: {
              id: 'mock-g1',
              schoolId: school.id,
              name: 'Grupo Principal (Defecto)',
              grade: 1,
              academicYear: '2026-2027'
            }
          });
        }
        
        // Asegurar que las materias de MOCK_SUBJECTS existan
        for (const subj of MOCK_SUBJECTS) {
          const existingSubj = await tx.subject.findUnique({ where: { id: subj.id } });
          if (!existingSubj) {
            await tx.subject.create({
              data: {
                id: subj.id,
                schoolId: school.id,
                name: subj.name,
                code: subj.id,
              }
            });
          }
        }
      }

      // Eliminar actuales
      await tx.teacherSubjectGroup.deleteMany({
        where: { teacherId }
      });

      // Crear nuevas
      if (assignments && assignments.length > 0) {
        await tx.teacherSubjectGroup.createMany({
          data: assignments.map((a: any) => ({
            teacherId,
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
      }
    });

    return NextResponse.json({ success: true, message: 'Horarios sincronizados correctamente' });
  } catch (error) {
    console.error('Error saving assignments:', error);
    return NextResponse.json({ success: false, error: 'Error al guardar asignaciones' }, { status: 500 });
  }
}
