import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    return payload.role === 'admin' || payload.role === 'principal';
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get('teacherId');
  const academicYear = searchParams.get('academicYear');

  if (!teacherId || !academicYear) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
  }

  try {
    const contract = await prisma.contract.findFirst({
      where: { teacherId, academicYear }
    });
    return NextResponse.json({ success: true, data: contract });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener contrato' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { teacherId, academicYear, applyToAll, ...configData } = body;

    if (!academicYear) {
      return NextResponse.json({ error: 'Falta ciclo escolar' }, { status: 400 });
    }

    if (applyToAll) {
      // Actualizar todos los contratos del ciclo actual
      await prisma.contract.updateMany({
        where: { academicYear },
        data: configData
      });
      return NextResponse.json({ success: true });
    }

    if (!teacherId) {
      return NextResponse.json({ error: 'Falta maestro' }, { status: 400 });
    }

    // Actualizar o crear para un solo maestro
    const existing = await prisma.contract.findFirst({
      where: { teacherId, academicYear }
    });

    if (existing) {
      await prisma.contract.update({
        where: { id: existing.id },
        data: configData
      });
    } else {
      await prisma.contract.create({
        data: {
          teacherId,
          academicYear,
          contractType: 'hourly',
          ...configData
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al guardar contrato' }, { status: 500 });
  }
}
