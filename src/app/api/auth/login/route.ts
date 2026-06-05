import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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

    if (user.status !== 'active') {
      return NextResponse.json({ error: 'Esta cuenta está inactiva. Contacta a un administrador.' }, { status: 403 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }

    // Optional: Update lastLogin
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // We don't generate a JWT here yet, we just return success so the frontend can redirect.
    // In a fully secure app, you'd set a cookie here. For Phase 1, frontend redirection is enough.
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
