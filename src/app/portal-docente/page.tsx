import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';
import { TeacherScheduleEditor } from '@/components/portal-docente/TeacherScheduleEditor';
import { TeacherDocumentUpload } from '@/components/portal-docente/TeacherDocumentUpload';
import { Calendar, Clock, FileText, ChevronLeft, ArrowRight, Construction } from 'lucide-react';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export default async function PortalDocentePage({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
  const token = cookies().get('auth-token')?.value;
  let teacherId = null;
  let teacherName = 'Docente';

  if (token) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      const email = payload.email as string;
      
      const teacher = await prisma.teacher.findFirst({ 
        where: { email: { equals: email, mode: 'insensitive' } } 
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
    let payloadEmail = 'desconocido';
    if (token) {
      try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
        payloadEmail = payload.email as string;
      } catch(e) {}
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8] p-4">
        <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md w-full border border-gray-100">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Perfil No Encontrado</h2>
          <p className="text-gray-600 mb-6">
            No se encontró un expediente de maestro para el correo: <b>{payloadEmail}</b>. 
            Asegúrate de que este correo coincida exactamente con el registrado en la <b>Gestión de Maestros</b>.
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

  const tab = searchParams.tab || 'dashboard';

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col font-sans">
      {/* Cabecera del Portal */}
      <header className="bg-gradient-to-r from-[#061266] to-[#1877f2] text-white shadow-md sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-xl tracking-tight hidden sm:block">Portal del Docente</h1>
          </div>
          {tab !== 'dashboard' && (
            <Link href="/portal-docente" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors px-4 py-1.5 rounded-full text-sm font-medium">
              <ChevronLeft className="w-4 h-4" />
              Volver al Menú
            </Link>
          )}
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 lg:p-8">
        
        {/* VISTA: DASHBOARD PRINCIPAL */}
        {tab === 'dashboard' && (
          <div className="fade-in">
            <div className="mb-10 print:hidden">
              <h2 className="text-4xl font-black text-[#061266] mb-3 tracking-tight">
                ¡Hola, {teacherName}! 👋
              </h2>
              <p className="text-gray-600 text-lg">Bienvenido a tu espacio personal. Selecciona una opción para comenzar.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Tarjeta 1: Disponibilidad */}
              <Link href="/portal-docente?tab=disponibilidad" className="group">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden flex flex-col">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Clock className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Envío de Disponibilidad</h3>
                  <p className="text-gray-500 mb-8 flex-1">Registra los días y horarios que tienes libres para que coordinación pueda asignarte grupos.</p>
                  <div className="flex items-center text-emerald-600 font-semibold text-sm group-hover:gap-2 transition-all gap-1">
                    Ingresar <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>

              {/* Tarjeta 2: Expediente */}
              <Link href="/portal-docente?tab=documentos" className="group">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden flex flex-col">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <FileText className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Expediente de Documentos</h3>
                  <p className="text-gray-500 mb-8 flex-1">Sube y actualiza tu documentación administrativa (CV, Acta, RFC, Título, etc.) en formato digital.</p>
                  <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all gap-1">
                    Ingresar <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>

              {/* Tarjeta 3: Horarios Asignados */}
              <Link href="/portal-docente/horarios" className="group">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden flex flex-col">
                  <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                  <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Calendar className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Horario Asignado</h3>
                  <p className="text-gray-500 mb-8 flex-1">Visualiza las materias, grupos y horarios específicos que coordinación te ha asignado para el ciclo escolar.</p>
                  <div className="flex items-center text-purple-600 font-semibold text-sm group-hover:gap-2 transition-all gap-1">
                    Ingresar <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>

            </div>
          </div>
        )}

        {/* VISTA: DISPONIBILIDAD */}
        {tab === 'disponibilidad' && (
          <div className="fade-in max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-6 h-6 text-emerald-600" />
                Registro de Disponibilidad
              </h2>
              <p className="text-gray-500">Llena la información con los días y horas que tienes disponibles.</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <TeacherScheduleEditor teacherId={teacherId} />
            </div>
          </div>
        )}

        {/* VISTA: DOCUMENTOS */}
        {tab === 'documentos' && (
          <div className="fade-in max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                Expediente Digital
              </h2>
              <p className="text-gray-500">Sube la documentación requerida por el área administrativa en formato PDF.</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <TeacherDocumentUpload teacherId={teacherId} />
            </div>
          </div>
        )}

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
