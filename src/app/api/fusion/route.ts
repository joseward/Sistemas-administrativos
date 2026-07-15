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

// POST: Crear una fusión
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { items } = await request.json();
    if (!items || !Array.isArray(items) || items.length < 2) {
      return NextResponse.json({ error: 'Se requieren al menos 2 materias para fusionar' }, { status: 400 });
    }

    const fusionGroupId = require('crypto').randomUUID();

    // Buscar si alguna de estas materias ya tiene una asignación (TeacherSubjectGroup)
    // Si la tiene, usaremos los datos de ESA asignación para propagarlos a las demás
    let baseAssignment = null;
    for (const item of items) {
      const existing = await prisma.teacherSubjectGroup.findFirst({
        where: {
          groupId: item.groupId,
          modulo: item.modulo,
          subjectId: item.subjectId
        }
      });
      if (existing && existing.teacherId) {
        baseAssignment = existing;
        break;
      } else if (existing && !baseAssignment) {
        baseAssignment = existing; // Fallback a una asignación vacía si existe
      }
    }

    // Ejecutar en transacción
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const existing = await tx.teacherSubjectGroup.findFirst({
          where: {
            groupId: item.groupId,
            modulo: item.modulo,
            subjectId: item.subjectId
          }
        });

        if (existing) {
          // Actualizar registro existente
          await tx.teacherSubjectGroup.update({
            where: { id: existing.id },
            data: {
              fusionGroupId,
              teacherId: baseAssignment?.teacherId || existing.teacherId,
              scheduleDay: baseAssignment?.scheduleDay || existing.scheduleDay,
              startTime: baseAssignment?.startTime || existing.startTime,
              endTime: baseAssignment?.endTime || existing.endTime,
              classroom: baseAssignment?.classroom || existing.classroom,
            }
          });
        } else {
          // Crear un nuevo registro fusionado
          await tx.teacherSubjectGroup.create({
            data: {
              groupId: item.groupId,
              subjectId: item.subjectId,
              modulo: item.modulo,
              academicYear: item.academicYear,
              cuatrimestre: item.cuatrimestre,
              fusionGroupId,
              createdById: userId,
              teacherId: baseAssignment?.teacherId || null,
              scheduleDay: baseAssignment?.scheduleDay || null,
              startTime: baseAssignment?.startTime || null,
              endTime: baseAssignment?.endTime || null,
              classroom: baseAssignment?.classroom || null,
            }
          });
        }
      }
    });

    return NextResponse.json({ success: true, fusionGroupId });
  } catch (error) {
    console.error('Error creating fusion:', error);
    return NextResponse.json({ error: 'Failed to create fusion' }, { status: 500 });
  }
}

// DELETE: Separar/Deshacer una fusión
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { fusionGroupId } = await request.json();
    if (!fusionGroupId) {
      return NextResponse.json({ error: 'Se requiere fusionGroupId' }, { status: 400 });
    }

    // Remover el fusionGroupId de todas las asignaciones
    await prisma.teacherSubjectGroup.updateMany({
      where: { fusionGroupId },
      data: {
        fusionGroupId: null
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting fusion:', error);
    return NextResponse.json({ error: 'Failed to delete fusion' }, { status: 500 });
  }
}
