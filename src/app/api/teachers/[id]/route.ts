import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, cedula, specialization, contractStatus } = body;

    const teacher = await prisma.teacher.findUnique({ where: { id: params.id } });
    if (!teacher) {
      return NextResponse.json({ success: false, error: 'Maestro no encontrado' }, { status: 404 });
    }

    // Comprobar si el email cambia y si está ocupado
    if (email && email !== teacher.email) {
      const existingTeacher = await prisma.teacher.findUnique({ where: { email } });
      if (existingTeacher) {
        return NextResponse.json({ success: false, error: 'El email ya está en uso' }, { status: 400 });
      }
    }

    const updatedTeacher = await prisma.$transaction(async (tx) => {
      // 1. Actualizar maestro
      const updated = await tx.teacher.update({
        where: { id: params.id },
        data: {
          firstName,
          lastName,
          email,
          phone,
          cedula,
          specialization,
          contractStatus,
        },
      });

      // 2. Actualizar su cuenta de usuario (buscar por el email antiguo que tenía el maestro)
      const user = await tx.user.findUnique({ where: { email: teacher.email } });
      if (user) {
        await tx.user.update({
          where: { id: user.id },
          data: {
            email: email || user.email,
            firstName: firstName || user.firstName,
            lastName: lastName || user.lastName,
            status: contractStatus === 'inactive' ? 'inactive' : 'active',
          },
        });
      }

      return updated;
    });

    return NextResponse.json({ success: true, data: updatedTeacher });
  } catch (error) {
    console.error('Error updating teacher:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teacher = await prisma.teacher.findUnique({ where: { id: params.id } });
    if (!teacher) {
      return NextResponse.json({ success: false, error: 'Maestro no encontrado' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Borrar usuario asociado
      const user = await tx.user.findUnique({ where: { email: teacher.email } });
      if (user) {
        await tx.user.delete({ where: { id: user.id } });
      }
      
      // Borrar maestro
      await tx.teacher.delete({ where: { id: params.id } });
    });

    return NextResponse.json({ success: true, message: 'Eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return NextResponse.json({ success: false, error: 'Error al eliminar' }, { status: 500 });
  }
}
