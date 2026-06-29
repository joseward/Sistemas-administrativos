import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const encoder = new TextEncoder();

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }

    // Check role match? For now, the user table might have role="admin" or "docente".
    // We allow if the requested role matches or if it's generic.
    if (user.role !== role && role !== 'any') {
       return NextResponse.json({ error: `Esta cuenta no tiene permisos de ${role}` }, { status: 403 });
    }

    if (user.status === 'blocked') {
      return NextResponse.json({ error: user.blockReason || 'Tu cuenta está bloqueada por seguridad. Contacta a administración.' }, { status: 403 });
    }

    if (user.status !== 'active') {
      return NextResponse.json({ error: 'Esta cuenta está inactiva. Contacta a un administrador.' }, { status: 403 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const newAttempts = (user.failedAttempts || 0) + 1;
      
      if (newAttempts >= 3) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            status: 'blocked',
            failedAttempts: newAttempts,
            blockReason: 'Superó el límite de 3 intentos fallidos de inicio de sesión.',
          },
        });
        return NextResponse.json({ error: 'Cuenta bloqueada por seguridad después de 3 intentos fallidos. Contacta a administración.' }, { status: 403 });
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: { failedAttempts: newAttempts },
        });
        const remaining = 3 - newAttempts;
        return NextResponse.json({ error: `Credenciales incorrectas. Te quedan ${remaining} intento(s).` }, { status: 401 });
      }
    }

    // Optional: Update lastLogin and reset failedAttempts
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        lastLogin: new Date(),
        failedAttempts: 0,
      },
    });

    // Generar JWT
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('8h') // 8 hours
      .sign(encoder.encode(JWT_SECRET));

    // Establecer la cookie HTTP-only
    cookies().set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 hours
    });

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });

  } catch (error) {
    console.error('Error in login API:', error);
    return NextResponse.json({ error: 'Error en el servidor al intentar iniciar sesión' }, { status: 500 });
  }
}
