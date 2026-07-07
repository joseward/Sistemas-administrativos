import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const data = await prisma.academicYear.findMany({
      where: { isActive: true },
      orderBy: { value: 'asc' }
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching academic years:', error);
    return NextResponse.json({ error: 'Failed to fetch academic years' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await prisma.academicYear.create({
      data: { value: body.value }
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating academic year:', error);
    return NextResponse.json({ error: 'Failed to create academic year' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    
    await prisma.academicYear.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting academic year:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
