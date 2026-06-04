/**
 * API Routes: Maestro por ID
 * Endpoints: GET /api/teachers/[id], PUT /api/teachers/[id], DELETE /api/teachers/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import * as teacherService from '@/services/teacherService';
import { ZodError, z } from 'zod';

// Esquema para actualizar maestro
const UpdateTeacherSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  cedula: z.string().optional(),
  specialization: z.string().optional(),
  contractStatus: z.enum(['active', 'inactive', 'pending']).optional(),
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
    // Maestro no encontrado
    if (error.message.includes('no encontrado')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 404 }
      );
    }

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
 * GET /api/teachers/[id]
 * Obtener un maestro específico con toda su información
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const teacher = await teacherService.getTeacherById(id);

    return NextResponse.json(
      {
        success: true,
        data: teacher,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PUT /api/teachers/[id]
 * Actualizar información de un maestro
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validar datos
    const validatedData = UpdateTeacherSchema.parse(body);

    // Actualizar maestro
    const updatedTeacher = await teacherService.updateTeacher(id, validatedData);

    return NextResponse.json(
      {
        success: true,
        message: 'Maestro actualizado exitosamente',
        data: updatedTeacher,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/teachers/[id]
 * Eliminar un maestro (cambiar a inactivo)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await teacherService.deleteTeacher(id);

    return NextResponse.json(
      {
        success: true,
        message: 'Maestro marcado como inactivo',
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
