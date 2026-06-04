/**
 * API Routes: Teacher Availability
 * Endpoints: POST /api/teachers/[id]/availability
 */

import { NextRequest, NextResponse } from 'next/server';
import * as teacherService from '@/services/teacherService';
import { z, ZodError } from 'zod';

// Esquema de validación
const AvailabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6, 'Día de semana inválido'),
  startTime: z.string().or(z.date()),
  endTime: z.string().or(z.date()),
});

// Helper para manejo de errores
function handleError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validación fallida',
        details: error.errors,
      },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: 'Error interno del servidor',
    },
    { status: 500 }
  );
}

/**
 * POST /api/teachers/[id]/availability
 * Crear o actualizar disponibilidad de un maestro
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: teacherId } = params;
    const body = await request.json();

    // Validar datos
    const validatedData = AvailabilitySchema.parse(body);

    // Convertir strings a Date si es necesario
    const startTime = typeof validatedData.startTime === 'string'
      ? new Date(validatedData.startTime)
      : validatedData.startTime;

    const endTime = typeof validatedData.endTime === 'string'
      ? new Date(validatedData.endTime)
      : validatedData.endTime;

    // Crear o actualizar disponibilidad
    const availability = await teacherService.setTeacherAvailability(
      teacherId,
      validatedData.dayOfWeek,
      startTime,
      endTime
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Disponibilidad actualizada',
        data: availability,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
