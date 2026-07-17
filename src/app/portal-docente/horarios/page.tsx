import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';
import { ChevronLeft, Calendar, Info } from 'lucide-react';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const DAYS_OF_WEEK = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const weekHours = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

export default async function TeacherHorarioPage() {
  const token = cookies().get('auth-token')?.value;
  let teacher = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      const email = payload.email as string;
      
      teacher = await prisma.teacher.findFirst({ 
        where: { email: { equals: email, mode: 'insensitive' } },
        include: {
          assignments: {
            where: { isAvailable: false },
            include: {
              subject: true,
              group: {
                include: { career: true }
              }
            }
          }
        }
      });
    } catch (err) {
      console.warn('Invalid token in portal-docente:', err);
    }
  }

  if (!teacher) {
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

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col font-sans">
      <header className="bg-gradient-to-r from-[#061266] to-[#1877f2] text-white shadow-md sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-xl tracking-tight hidden sm:block">Portal del Docente</h1>
          </div>
          <Link href="/portal-docente" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors px-4 py-1.5 rounded-full text-sm font-medium">
            <ChevronLeft className="w-4 h-4" />
            Volver al Menú
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 lg:p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-[#061266] mb-2 tracking-tight flex items-center gap-3">
            <Calendar className="w-8 h-8 text-purple-600" />
            Horario Asignado
          </h2>
          <p className="text-gray-600">Revisa tus clases programadas para el ciclo actual.</p>
        </div>

        {!teacher.schedulesPublishedAt ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center max-w-2xl mx-auto mt-10">
            <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Info className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Horario en Preparación</h3>
            <p className="text-gray-500 text-lg">
              Coordinación académica aún está estructurando los horarios para este ciclo escolar. 
              Te notificaremos en cuanto tu horario esté publicado y listo para ser visualizado aquí.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-3 text-left font-semibold text-gray-600 w-20 sticky left-0 bg-gray-50 z-10">
                      Hora
                    </th>
                    {DAYS_OF_WEEK.map((day, i) => (
                      <th key={i} className="px-3 py-3 text-center font-semibold text-gray-700 min-w-[160px]">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {weekHours.map((hour) => (
                    <tr key={hour} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="px-3 py-3 text-gray-500 font-mono text-xs font-semibold sticky left-0 bg-white border-r border-gray-100 z-10">
                        {hour}
                      </td>
                      {DAYS_OF_WEEK.map((_, dayIndex) => {
                        // Buscar asignaciones para este día y que cubran esta hora
                        const slots = teacher.assignments.filter(a => 
                          a.scheduleDay === dayIndex && 
                          a.startTime !== null && 
                          a.endTime !== null && 
                          a.startTime <= hour && 
                          a.endTime > hour
                        );

                        if (slots.length === 0) {
                          return <td key={dayIndex} className="px-1 py-1"></td>;
                        }

                        // Agrupar por fusionGroupId si existe, o dejarlas separadas
                        const groupedSlots: any[] = [];
                        const fusionMap = new Map<string, typeof slots>();
                        
                        slots.forEach(slot => {
                          if (slot.fusionGroupId) {
                            if (!fusionMap.has(slot.fusionGroupId)) fusionMap.set(slot.fusionGroupId, []);
                            fusionMap.get(slot.fusionGroupId)!.push(slot);
                          } else {
                            groupedSlots.push([slot]);
                          }
                        });

                        fusionMap.forEach(group => groupedSlots.push(group));

                        return (
                          <td key={dayIndex} className="px-1 py-1 align-top">
                            {groupedSlots.map((group, idx) => {
                              // Solo renderizar en la primera hora del bloque
                              if (group[0].startTime !== hour) return null;

                              const isFused = group.length > 1;
                              const subjectName = group[0].subject.name;
                              const timeRange = `${group[0].startTime} - ${group[0].endTime}`;
                              const classroom = group[0].classroom || 'Sin aula';
                              
                              let groupLabel = '';
                              let tooltipText = '';

                              if (isFused) {
                                groupLabel = 'Múltiples Grupos 🔗';
                                tooltipText = group.map((s: any) => `${s.group.name} (${s.group.career?.name || 'Gral'})`).join(' | ');
                              } else {
                                groupLabel = group[0].group.name;
                                tooltipText = group[0].group.career?.name || 'Materia General';
                              }

                              return (
                                <div
                                  key={idx}
                                  className="m-1 p-2 rounded-md bg-purple-50 border border-purple-200 shadow-sm transition-all hover:shadow-md group relative cursor-default"
                                >
                                  <div className="font-bold text-purple-900 text-xs leading-tight mb-1">
                                    {subjectName}
                                  </div>
                                  <div className="text-[10px] font-semibold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded inline-block mb-1" title={tooltipText}>
                                    {groupLabel}
                                  </div>
                                  <div className="flex flex-col gap-0.5 text-[10px] text-gray-600 mt-1">
                                    <div className="flex items-center gap-1">
                                      <span>⏰</span> {timeRange}
                                    </div>
                                    <div className="flex items-center gap-1 font-medium">
                                      <span>📍</span> {classroom}
                                    </div>
                                  </div>
                                  
                                  {isFused && (
                                    <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded py-1 px-2 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-[200px] text-center pointer-events-none z-20">
                                      Clase Compartida: {tooltipText}
                                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
