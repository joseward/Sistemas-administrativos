import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';
import { ChevronLeft, Calendar, Info, AlertCircle } from 'lucide-react';
import { TeacherAssignedScheduleView } from '@/components/portal-docente/TeacherAssignedScheduleView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export default async function TeacherHorarioPage() {
  const token = cookies().get('auth-token')?.value;
  let teacher: any = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      const email = payload.email as string;

      teacher = await prisma.teacher.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } },
        include: {
          assignments: {
            where: {
              scheduleDay: { gte: 0 },
            },
            include: {
              subject: true,
              group: {
                include: { career: true },
              },
            },
          },
        },
      });
    } catch (err) {
      console.warn('Invalid token in portal-docente:', err);
    }
  }

  let activeYear = '2026-2027';
  let activeCuatri = 1;

  if (teacher && teacher.assignments && teacher.assignments.length > 0) {
    // Buscar el ciclo más reciente
    const sorted = [...teacher.assignments].sort((a, b) => {
      if (a.academicYear > b.academicYear) return -1;
      if (a.academicYear < b.academicYear) return 1;
      return (b.cuatrimestre || 1) - (a.cuatrimestre || 1);
    });

    activeYear = sorted[0].academicYear || '2026-2027';
    activeCuatri = sorted[0].cuatrimestre || 1;

    teacher.assignments = teacher.assignments.filter(
      (a: any) => a.academicYear === activeYear
    );
  }

  if (!teacher) {
    let payloadEmail = 'desconocido';
    if (token) {
      try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
        payloadEmail = payload.email as string;
      } catch (e) {}
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8] p-4">
        <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md w-full border border-gray-100">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Perfil No Encontrado</h2>
          <p className="text-gray-600 mb-6">
            No se encontró un expediente de maestro para el correo: <b>{payloadEmail}</b>. Asegúrate de que este correo coincida exactamente con el registrado en la <b>Gestión de Maestros</b>.
          </p>
          <Link href="/login">
            <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 w-full transition-colors">
              Regresar al Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const hasAssignedClasses = teacher.assignments && teacher.assignments.length > 0;

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col font-sans">
      <header className="bg-gradient-to-r from-[#061266] to-[#1877f2] text-white shadow-md sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-xl tracking-tight hidden sm:block">Portal del Docente</h1>
          </div>
          <Link
            href="/portal-docente"
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors px-4 py-1.5 rounded-full text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver al Menú
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 lg:p-8">
        <div className="mb-6 print:hidden">
          <h2 className="text-3xl font-black text-[#061266] mb-1 tracking-tight flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            Mi Horario de Clases
          </h2>
          <p className="text-gray-600 text-sm">
            Consulta tus materias, grupos, días, horarios y salones asignados por Coordinación Académica.
          </p>
        </div>

        {!hasAssignedClasses ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center max-w-2xl mx-auto mt-10">
            <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Info className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Horario en Preparación</h3>
            <p className="text-gray-500 text-base">
              Coordinación académica aún está estructurando tus materias para este ciclo escolar. En cuanto te asignen tus clases, aparecerán aquí automáticamente.
            </p>
          </div>
        ) : (
          <TeacherAssignedScheduleView
            teacherName={`${teacher.firstName} ${teacher.lastName}`}
            academicYear={activeYear}
            cuatrimestre={activeCuatri}
            assignments={teacher.assignments}
          />
        )}
      </main>
    </div>
  );
}
