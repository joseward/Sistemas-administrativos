import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

async function getUserId() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    const modulo = searchParams.get('modulo');

    const where: any = {};
    if (groupId) where.groupId = groupId;
    if (modulo) where.modulo = parseInt(modulo);

    const templates = await prisma.groupTemplate.findMany({
      where,
      include: {
        subjects: {
          include: {
            subject: true
          }
        },
        group: {
          include: {
            career: true
          }
        },
        createdBy: true
      },
      orderBy: [{ modulo: 'asc' }],
    });
    
    // Transformar a un formato más amigable para el frontend
    const formatted = templates.map(t => ({
      id: t.id,
      groupId: t.groupId,
      modulo: t.modulo,
      turno: t.turno,
      classroom: t.classroom,
      subjectIds: t.subjects.map(s => s.subjectId),
      subjects: t.subjects.map(s => s.subject),
      group: t.group,
      createdBy: t.createdBy
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = await getUserId();
    
    const template = await prisma.groupTemplate.create({
      data: {
        groupId: body.groupId,
        modulo: body.modulo,
        turno: body.turno,
        classroom: body.classroom,
        createdById: userId,
        subjects: {
          create: body.subjectIds.map((id: string) => ({
            subject: { connect: { id } }
          }))
        }
      }
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const userId = await getUserId();
    
    // First, delete existing subjects for this template
    await prisma.templateSubject.deleteMany({
      where: { templateId: body.id }
    });

    // Then update the template and recreate the subject relationships
    // Actualizamos el createdById también por si fue editado
    const template = await prisma.groupTemplate.update({
      where: { id: body.id },
      data: {
        groupId: body.groupId,
        modulo: body.modulo,
        turno: body.turno,
        classroom: body.classroom,
        createdById: userId, // Dejamos huella de quién fue el último que la modificó/guardó
        subjects: {
          create: body.subjectIds.map((id: string) => ({
            subject: { connect: { id } }
          }))
        }
      }
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await prisma.groupTemplate.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}
