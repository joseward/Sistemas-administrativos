import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

async function getUserId() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      return payload.id as string;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export async function POST(request: Request) {
  try {
    const { sourceTemplateId, targetGroupId, modulo, turno, classroom } = await request.json();

    if (!sourceTemplateId || !targetGroupId) {
      return NextResponse.json({ error: 'sourceTemplateId and targetGroupId are required' }, { status: 400 });
    }

    const userId = await getUserId();

    // 1. Obtener la plantilla de origen con sus materias
    const sourceTemplate = await prisma.groupTemplate.findUnique({
      where: { id: sourceTemplateId },
      include: { subjects: true }
    });

    if (!sourceTemplate) {
      return NextResponse.json({ error: 'Source template not found' }, { status: 404 });
    }

    const targetModulo = modulo !== undefined ? Number(modulo) : sourceTemplate.modulo;
    const targetTurno = turno || sourceTemplate.turno;
    const targetClassroom = classroom || sourceTemplate.classroom;
    const subjectIds = sourceTemplate.subjects.map(s => s.subjectId);

    // 2. Verificar si el grupo destino ya tiene plantilla para este módulo
    const existing = await prisma.groupTemplate.findFirst({
      where: {
        groupId: targetGroupId,
        modulo: targetModulo
      }
    });

    let resultTemplate;

    if (existing) {
      // Si ya existe, reemplazamos o agregamos las materias de la plantilla clonada
      await prisma.templateSubject.deleteMany({
        where: { templateId: existing.id }
      });

      resultTemplate = await prisma.groupTemplate.update({
        where: { id: existing.id },
        data: {
          turno: targetTurno,
          classroom: targetClassroom,
          startTime: sourceTemplate.startTime,
          endTime: sourceTemplate.endTime,
          createdById: userId,
          subjects: {
            create: subjectIds.map(id => ({
              subject: { connect: { id } }
            }))
          }
        }
      });
    } else {
      // Crear nueva plantilla para el grupo destino
      resultTemplate = await prisma.groupTemplate.create({
        data: {
          groupId: targetGroupId,
          modulo: targetModulo,
          turno: targetTurno,
          classroom: targetClassroom,
          startTime: sourceTemplate.startTime,
          endTime: sourceTemplate.endTime,
          createdById: userId,
          subjects: {
            create: subjectIds.map(id => ({
              subject: { connect: { id } }
            }))
          }
        }
      });
    }

    return NextResponse.json({ success: true, data: resultTemplate });
  } catch (error) {
    console.error('Error cloning template:', error);
    return NextResponse.json({ error: 'Failed to clone template' }, { status: 500 });
  }
}
