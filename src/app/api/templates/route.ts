import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
        }
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
      group: t.group
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
    
    const template = await prisma.groupTemplate.create({
      data: {
        groupId: body.groupId,
        modulo: body.modulo,
        turno: body.turno,
        classroom: body.classroom,
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
