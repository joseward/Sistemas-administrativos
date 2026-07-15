import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// POST: Crear o actualizar una asignación individual
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }
    
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    const userId = payload.id as string;

    const body = await request.json();
    const { id, teacherId, subjectId, groupId, scheduleDay, startTime, endTime, classroom, modulo, cuatrimestre, isAvailable, academicYear } = body;

    if (!subjectId || !groupId) {
      return NextResponse.json({ success: false, error: 'Faltan datos requeridos (subjectId, groupId)' }, { status: 400 });
    }

    if (id && !id.startsWith('unassigned-') && !id.startsWith('mock-') && !id.startsWith('pending-')) {
      // Actualizar existente
      const existing = await prisma.teacherSubjectGroup.findUnique({ where: { id } });
      
      const updateData: any = {
        teacherId,
        subjectId,
        groupId,
        modulo,
        cuatrimestre,
        academicYear: academicYear || '2023-2024',
        isAvailable: isAvailable || false,
        createdById: userId,
      };

      if (scheduleDay !== undefined) updateData.scheduleDay = scheduleDay;
      if (startTime !== undefined) updateData.startTime = startTime;
      if (endTime !== undefined) updateData.endTime = endTime;
      if (classroom !== undefined) updateData.classroom = classroom;

      if (existing?.fusionGroupId) {
        // En fusion, no actualizamos subjectId ni groupId porque son distintos por materia fusionada.
        const { subjectId: _, groupId: __, ...fusionUpdateData } = updateData;
        await prisma.teacherSubjectGroup.updateMany({
          where: { fusionGroupId: existing.fusionGroupId },
          data: fusionUpdateData
        });
      } else {
        await prisma.teacherSubjectGroup.update({
          where: { id },
          data: updateData
        });
      }
    } else {
      // Crear nueva asignación individual si existía otra previamente asignada, la eliminamos (para este grupo/materia)
      // porque solo un maestro puede dar una materia a un grupo.
      await prisma.teacherSubjectGroup.deleteMany({
        where: {
          subjectId,
          groupId
        }
      });

      await prisma.teacherSubjectGroup.create({
        data: {
          teacherId,
          subjectId,
          groupId,
          scheduleDay: scheduleDay !== undefined ? scheduleDay : -1,
          startTime: startTime || '',
          endTime: endTime || '',
          classroom: classroom || '',
          modulo,
          cuatrimestre,
          academicYear: academicYear || '2023-2024',
          isAvailable: isAvailable || false,
          createdById: userId,
        }
      });
    }

    return NextResponse.json({ success: true, message: 'Asignación guardada correctamente' });
  } catch (error) {
    console.error('Error saving single assignment:', error);
    return NextResponse.json({ success: false, error: 'Error al guardar asignación' }, { status: 500 });
  }
}
