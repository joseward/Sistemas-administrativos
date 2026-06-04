/**
 * API Routes: Delete Teacher Availability
 * Endpoints: DELETE /api/teachers/[id]/availability/[availabilityId]
 */

import { NextRequest, NextResponse } from 'next/server';
import * as teacherService from '@/services/teacherService';

// Helper para manejo de errores
function handleError(error: unknown) {
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
 * DELETE /api/teachers/[id]/availability/[availabilityId]
 * Eliminar una disponibilidad específica
 */
export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: { id: string; availabilityId: string };
  }
) {
  try {
    const { availabilityId } = params;

    // Eliminar disponibilidad
    const result = await teacherService.deleteTeacherAvailability(availabilityId);

    return NextResponse.json(
      {
        success: true,
        message: 'Disponibilidad eliminada',
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
