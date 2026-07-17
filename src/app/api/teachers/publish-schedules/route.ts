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

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { teacherId } = await request.json();

    const updateData = { schedulesPublishedAt: new Date() };

    if (teacherId) {
      // Publicar para un solo maestro
      await prisma.teacher.update({
        where: { id: teacherId },
        data: updateData
      });
    } else {
      // Publicar para todos
      await prisma.teacher.updateMany({
        data: updateData
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error publishing schedules:', error);
    return NextResponse.json({ error: 'Error al publicar los horarios' }, { status: 500 });
  }
}
