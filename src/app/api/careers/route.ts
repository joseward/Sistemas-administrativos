import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const academicLevelId = searchParams.get('academicLevelId');

    const where = academicLevelId ? { academicLevelId } : {};

    const careers = await prisma.career.findMany({
      where,
      include: {
        academicLevel: true,
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(careers);
  } catch (error) {
    console.error('Error fetching careers:', error);
    return NextResponse.json({ error: 'Failed to fetch careers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Asumimos que el primer nivel académico es el default si no se proporciona, 
    // pero idealmente deberíamos recibirlo del cliente. Por ahora crearemos 
    // una carrera asociada a "Licenciaturas Ejecutivas" si no hay academicLevelId
    
    let academicLevelId = body.academicLevelId;
    if (!academicLevelId) {
      let defaultLevel = await prisma.academicLevel.findFirst();
      if (!defaultLevel) {
        // Fallback si no existe ninguno, crearlo
        defaultLevel = await prisma.academicLevel.create({
          data: { name: 'Licenciaturas Ejecutivas', schoolId: 'cm6k3h2a30000abc' } // ID temporal, debería usar el real de auth
        });
      }
      academicLevelId = defaultLevel.id;
    }
    
    // Obtener un schoolId válido
    const level = await prisma.academicLevel.findUnique({ where: { id: academicLevelId } });

    const career = await prisma.career.create({
      data: {
        name: body.name,
        academicLevelId: academicLevelId,
        schoolId: level?.schoolId || 'cm6k3h2a30000abc' // schoolId requerido
      }
    });

    return NextResponse.json(career);
  } catch (error) {
    console.error('Error creating career:', error);
    return NextResponse.json({ error: 'Failed to create career' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    
    await prisma.career.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting career:', error);
    return NextResponse.json({ error: 'Failed to delete career' }, { status: 500 });
  }

