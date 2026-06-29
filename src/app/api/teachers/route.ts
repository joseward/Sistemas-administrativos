import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolId = searchParams.get('schoolId');

    const teachers = await prisma.teacher.findMany({
      where: schoolId ? { schoolId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        createdByUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json({ success: true, data: teachers, pagination: { total: teachers.length, pages: 1 } });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener maestros' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, cedula, specialization, contractStatus } = body;

    // Obtener quién está creando el maestro
    let adminId = undefined;
    const token = request.cookies.get('auth-token')?.value;
    if (token) {
      try {
        const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
        const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
        
        if (payload.role !== 'admin') {
          return NextResponse.json({ success: false, error: 'No tienes permisos de administrador para realizar esta acción' }, { status: 403 });
        }
        
        if (payload && payload.id) {
          adminId = payload.id as string;
        }
      } catch (err) {
        console.warn('Error verificando token para createdBy:', err);
      }
    }

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ success: false, error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    // Verificar que exista al menos una escuela (para la relación)
    let school = await prisma.school.findFirst();
    if (!school) {
      school = await prisma.school.create({
        data: {
          name: 'Universidad Aztlán',
        }
      });
    }

    // Verificar si el correo ya existe
    const existingTeacher = await prisma.teacher.findUnique({ where: { email } });
    if (existingTeacher) {
      return NextResponse.json({ success: false, error: 'El correo ya está registrado' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Ya existe un usuario con este correo' }, { status: 400 });
    }

    // Encriptar la contraseña por defecto "docente123"
    const hashedPassword = await bcrypt.hash('docente123', 10);

    // Ejecutar en una transacción para que ambas operaciones se completen o ninguna
    const newTeacher = await prisma.$transaction(async (tx) => {
      // 1. Crear el Maestro
      const teacher = await tx.teacher.create({
        data: {
          schoolId: school.id,
          firstName,
          lastName,
          email,
          phone,
          cedula,
          specialization,
          contractStatus: contractStatus || 'active',
          createdByUserId: adminId,
        },
      });

      // 2. Crear su cuenta de Usuario para el Login
      await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'docente',
          firstName,
          lastName,
          status: contractStatus === 'inactive' ? 'inactive' : 'active',
        },
      });

      return teacher;
    });

    return NextResponse.json({ success: true, data: newTeacher }, { status: 201 });
  } catch (error) {
    console.error('Error creating teacher:', error);
    return NextResponse.json({ success: false, error: 'Error al crear maestro' }, { status: 500 });
  }
}
