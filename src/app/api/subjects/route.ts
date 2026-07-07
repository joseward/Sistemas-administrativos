import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const careerId = searchParams.get('careerId');
    const cuatrimestre = searchParams.get('cuatrimestre');

    const where: any = {};
    if (careerId) where.careerId = careerId;
    if (cuatrimestre) where.cuatrimestre = parseInt(cuatrimestre);

    const subjects = await prisma.subject.findMany({
      where,
      orderBy: [{ cuatrimestre: 'asc' }, { name: 'asc' }],
    });
    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}
