import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// GET: Listar todas las aulas
export async function GET(request: NextRequest) {
  try {
    const classrooms = await prisma.classroom.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(classrooms);
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Crear una nueva aula
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));

    const body = await request.json();
    const { name } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'El nombre del aula es requerido' }, { status: 400 });
    }

    const classroom = await prisma.classroom.create({
      data: {
        name: name.trim()
      }
    });

    return NextResponse.json(classroom);
  } catch (error: any) {
    console.error('Error creating classroom:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'El aula ya existe' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Eliminar un aula
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Se requiere ID del aula' }, { status: 400 });
    }

    await prisma.classroom.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting classroom:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
