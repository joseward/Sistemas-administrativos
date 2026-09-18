import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { ensureContractForTeacher, getLatestContractConfig, upsertContractsForAllTeachers } from '@/lib/contracts';

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
  const academicYear = searchParams.get('academicYear') || undefined;

  try {
    if (teacherId) {
      // Buscar contrato del maestro para el ciclo especificado
      let contract = await prisma.contract.findFirst({
        where: {
          teacherId,
          ...(academicYear ? { academicYear } : {})
        },
        orderBy: { updatedAt: 'desc' }
      });

      // Si no existe, intentar asegurar/autogenerar si el docente existe
      if (!contract) {
        contract = await ensureContractForTeacher(teacherId, academicYear);
      }

      // Si aún no tiene contrato guardado, devolver la configuración global más reciente como base
      if (!contract) {
        const config = await getLatestContractConfig(academicYear);
        return NextResponse.json({ success: true, data: config, isDefault: true });
      }

      return NextResponse.json({ success: true, data: contract });
    }

    // Si no se pide un maestro específico, devolver la configuración global activa
    const globalConfig = await getLatestContractConfig(academicYear);
    return NextResponse.json({ success: true, data: globalConfig });
  } catch (error) {
    console.error('Error al obtener contrato:', error);
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

    const year = academicYear || '2026-2027';

    if (applyToAll) {
      // Aplicar y asegurar contrato para todos los maestros
      await upsertContractsForAllTeachers(year, configData);
      return NextResponse.json({ success: true, message: 'Configuración aplicada a todos los maestros' });
    }

    if (!teacherId) {
      return NextResponse.json({ error: 'Falta maestro' }, { status: 400 });
    }

    // Obtener maestro para conocer schoolId
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      select: { schoolId: true }
    });

    // Actualizar o crear para un solo maestro
    const existing = await prisma.contract.findFirst({
      where: { teacherId, academicYear: year }
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
          schoolId: teacher?.schoolId,
          academicYear: year,
          contractType: 'hourly',
          ...configData
        }
      });
    }

    return NextResponse.json({ success: true, message: 'Contrato guardado correctamente' });
  } catch (error) {
    console.error('Error al guardar contrato:', error);
    return NextResponse.json({ error: 'Error al guardar contrato' }, { status: 500 });
  }
}
