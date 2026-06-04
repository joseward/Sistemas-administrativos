'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MOCK_TEACHERS } from '@/lib/mockData';
import { TeacherScheduleEditor } from '@/components/portal-docente/TeacherScheduleEditor';

export default function PortalDocentePage() {
  // Simulador de sesión: Permite cambiar entre maestros para pruebas
  const [activeTeacherId, setActiveTeacherId] = useState<string>(MOCK_TEACHERS[0]?.id || '');

  const activeTeacher = MOCK_TEACHERS.find(t => t.id === activeTeacherId);

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col font-sans">
      {/* Cabecera del Portal */}
      <header className="bg-emerald-700 text-white shadow-md sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👨‍🏫</span>
            <h1 className="font-bold text-lg hidden sm:block">Portal del Docente</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Usuario Actual (Simulador) */}
            <div className="flex items-center bg-emerald-800/50 rounded-lg p-1.5 border border-emerald-600/30">
              <span className="text-lg mr-2 ml-1">👤</span>
              <select 
                value={activeTeacherId}
                onChange={(e) => setActiveTeacherId(e.target.value)}
                className="bg-transparent text-white text-sm outline-none font-medium appearance-none cursor-pointer pr-4"
                title="Cambiar usuario para pruebas"
              >
                {MOCK_TEACHERS.map(t => (
                  <option key={t.id} value={t.id} className="text-gray-800">
                    {t.firstName} {t.lastName}
                  </option>
                ))}
              </select>
            </div>

            <Link href="/login">
              <button className="text-sm font-medium hover:text-emerald-200 transition-colors flex items-center gap-1">
                Salir 🚪
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 lg:p-8">
        
        {/* Saludo */}
        <div className="mb-8 print:hidden">
          <h2 className="text-3xl font-black text-[#061266] mb-2">
            ¡Hola, {activeTeacher?.firstName}! 👋
          </h2>
          <p className="text-gray-600">Bienvenido a tu espacio personal. Gestiona tus asignaturas y horarios de clase por módulo.</p>
        </div>

        {/* Área dinámica */}
        <div className="min-h-[500px]">
          {activeTeacherId ? (
            <TeacherScheduleEditor teacherId={activeTeacherId} />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              Selecciona un docente en la barra superior para comenzar.
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
