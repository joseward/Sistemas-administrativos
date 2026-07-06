import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';



export async function PUT(request: NextRequest) {
  try {
    const token = cookies().get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    
    if (!payload.email) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    // Validación extra en el servidor
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json({ error: 'La nueva contraseña no cumple con los requisitos mínimos de seguridad' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: payload.email as string },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Verificar contraseña actual
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'La contraseña actual es incorrecta' }, { status: 401 });
    }

    // Actualizar con la nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
      },
    });

    return NextResponse.json({ success: true, message: 'Contraseña actualizada' }, { status: 200 });

  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({ error: 'Error al cambiar la contraseña' }, { status: 500 });
  }
}
