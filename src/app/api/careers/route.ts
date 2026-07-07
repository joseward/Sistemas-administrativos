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
