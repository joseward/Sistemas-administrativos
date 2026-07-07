import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const levels = await prisma.academicLevel.findMany({
      include: {
        careers: true,
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(levels);
  } catch (error) {
    console.error('Error fetching academic levels:', error);
    return NextResponse.json({ error: 'Failed to fetch academic levels' }, { status: 500 });
  }
}
