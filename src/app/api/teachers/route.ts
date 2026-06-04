/**
 * API Routes: Maestros (Teachers)
 * Endpoints: GET /api/teachers, POST /api/teachers
 */

import { NextRequest, NextResponse } from 'next/server';
import * as teacherService from '@/services/teacherService';
import { ZodError, z } from 'zod';

// Esquemas de validación
const CreateTeacherSchema = z.object({
  schoolId: z.string().min(1, 'Escuela requerida'),
  firstName: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'Apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  cedula: z.string().optional(),
  specialization: z.string().optional(),
  contractStatus: z.enum(['active', 'inactive', 'pending']).default('pending'),
});

const QueryParamsSchema = z.object({
  schoolId: z.string().min(1, 'schoolId requerido'),
  page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
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
 * GET /api/teachers
 * Obtener lista de maestros por escuela
 * Query params: schoolId, page?, limit?
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryData = {
      schoolId: searchParams.get('schoolId'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    };

    // Validar parámetros
    const validatedParams = QueryParamsSchema.parse(queryData);

    // Obtener maestros
    const result = await teacherService.getAllTeachers(validatedParams.schoolId, {
      page: validatedParams.page,
      limit: validatedParams.limit,
    });

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: result.pages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/teachers
 * Crear un nuevo maestro
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar datos de entrada
    const validatedData = CreateTeacherSchema.parse(body);

    // Crear maestro
    const teacher = await teacherService.createTeacher(validatedData);

    return NextResponse.json(
      {
        success: true,
        message: 'Maestro creado exitosamente',
        data: teacher,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
