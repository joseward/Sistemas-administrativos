import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// GET: Obtener disponibilidad (filtrable por teacherId)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const teacherId = searchParams.get('teacherId');

    const availabilities = await prisma.teacherAvailability.findMany({
      where: teacherId ? { teacherId } : undefined,
    });

    // Transformar los DateTimes a strings HH:mm para el frontend
    const formatted = availabilities.map(a => ({
      id: a.id,
      teacherId: a.teacherId,
      dayOfWeek: a.dayOfWeek,
      startTime: a.startTime.toISOString().substring(11, 16),
      endTime: a.endTime.toISOString().substring(11, 16),
      isAvailable: a.isAvailable
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener disponibilidad' }, { status: 500 });
  }
}

// POST: Sincronizar disponibilidad de un maestro
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    
    const body = await request.json();
    const { teacherId, availability } = body; // availability es un array

    if (!teacherId) {
      return NextResponse.json({ success: false, error: 'Se requiere teacherId' }, { status: 400 });
    }

    if (payload.role === 'docente') {
      const teacher = await prisma.teacher.findUnique({
        where: { email: payload.email as string }
      });
      if (!teacher || teacher.id !== teacherId) {
        return NextResponse.json({ success: false, error: 'No tienes permiso para modificar a este maestro' }, { status: 403 });
      }
    }

    await prisma.$transaction(async (tx) => {
      // Eliminar disponibilidad actual
      await tx.teacherAvailability.deleteMany({
        where: { teacherId }
      });

      // Crear nueva
      if (availability && availability.length > 0) {
        await tx.teacherAvailability.createMany({
          data: availability.map((a: any) => ({
            teacherId,
            dayOfWeek: a.dayOfWeek,
            // Guardamos la hora de forma consistente
            startTime: new Date(`1970-01-01T${a.startTime}:00Z`),
            endTime: new Date(`1970-01-01T${a.endTime}:00Z`),
            isAvailable: true
          }))
        });
      }
    });

    return NextResponse.json({ success: true, message: 'Disponibilidad guardada correctamente' });
  } catch (error) {
    console.error('Error saving availability:', error);
    return NextResponse.json({ success: false, error: 'Error al guardar disponibilidad' }, { status: 500 });
  }
}
