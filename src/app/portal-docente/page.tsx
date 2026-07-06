import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { PrismaClient } from '@prisma/client';
import { TeacherScheduleEditor } from '@/components/portal-docente/TeacherScheduleEditor';
import { ChangePasswordForm } from '@/components/portal-docente/ChangePasswordForm';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export default async function PortalDocentePage() {
  const token = cookies().get('auth-token')?.value;
  let teacherId = null;
  let teacherName = 'Docente';

  if (token) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      const email = payload.email as string;
      
      // Buscar al maestro por su correo
      const teacher = await prisma.teacher.findUnique({ 
        where: { email } 
      });
      
      if (teacher) {
        teacherId = teacher.id;
        teacherName = teacher.firstName;
      }
    } catch (err) {
      console.warn('Invalid token in portal-docente:', err);
    }
  }

  if (!teacherId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8] p-4">
        <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md w-full border border-gray-100">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Perfil No Encontrado</h2>
          <p className="text-gray-600 mb-6">
            No se encontró un perfil de maestro asociado a tu cuenta actual. 
            Asegúrate de que tu correo de inicio de sesión coincida con el correo registrado en la <b>Gestión de Maestros</b>.
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

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col font-sans">
      {/* Cabecera del Portal */}
      <header className="bg-emerald-700 text-white shadow-md sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-lg hidden sm:block">Portal del Docente</h1>
          </div>

        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 lg:p-8">
        
        {/* Saludo */}
        <div className="mb-8 print:hidden">
          <h2 className="text-3xl font-black text-[#061266] mb-2">
            ¡Hola, {teacherName}!
          </h2>
          <p className="text-gray-600">Bienvenido a tu espacio personal. Gestiona tus asignaturas y horarios de clase por módulo.</p>
        </div>

        {/* Área dinámica */}
        <div className="min-h-[500px]">
          <TeacherScheduleEditor teacherId={teacherId} />
          <ChangePasswordForm />
        </div>

      </main>
    </div>
  );
}
