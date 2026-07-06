import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';



export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = cookies().get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    
    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'No tienes permisos de administrador para desbloquear usuarios' }, { status: 403 });
    }

    const { id } = params;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        status: 'active',
        failedAttempts: 0,
        blockReason: null,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error unblocking user:', error);
    return NextResponse.json({ error: 'Error al desbloquear el usuario' }, { status: 500 });
  }
}
