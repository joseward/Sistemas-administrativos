import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const careerId = searchParams.get('careerId');

    const where: any = {};
    if (careerId) where.careerId = careerId;

    const groups = await prisma.group.findMany({
      where,
      include: {
        career: true,
      },
      orderBy: [{ careerId: 'asc' }, { cuatrimestre: 'asc' }, { name: 'asc' }],
    });
    return NextResponse.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Asignar el schoolId del primer school encontrado para simplificar (o recibirlo del body)
    let schoolId = body.schoolId;
    if (!schoolId) {
      const school = await prisma.school.findFirst();
      if (!school) return NextResponse.json({ error: 'No school found' }, { status: 400 });
      schoolId = school.id;
    }

    const group = await prisma.group.create({
      data: {
        name: body.name,
        schoolId,
        careerId: body.careerId,
        cuatrimestre: body.cuatrimestre,
        grade: body.cuatrimestre || 1, // fallback
        section: body.section,
        modality: body.modality,
        totalStudents: body.totalStudents || 0,
        academicYear: body.academicYear || new Date().getFullYear().toString(),
      },
      include: {
        career: true,
      }
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await prisma.group.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 });
  }
}
