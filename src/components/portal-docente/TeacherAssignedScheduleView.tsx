'use client';

import React, { useState, useMemo } from 'react';
import { DAYS_OF_WEEK } from '@/lib/mockData';
import {
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  Users,
  Link2,
  Printer,
  LayoutList,
  Table as TableIcon,
  GraduationCap,
  Layers,
} from 'lucide-react';

interface TeacherAssignedScheduleViewProps {
  teacherName: string;
  academicYear: string;
  cuatrimestre: number;
  assignments: any[];
}

export function TeacherAssignedScheduleView({
  teacherName,
  academicYear,
  cuatrimestre,
  assignments,
}: TeacherAssignedScheduleViewProps) {
  const [viewMode, setViewMode] = useState<'agenda' | 'table'>('agenda');
  const [selectedModulo, setSelectedModulo] = useState<'all' | '1' | '2'>('all');

  // Consolidar clases que están fusionadas (mismo fusionGroupId o mismo día y hora)
  const consolidatedClasses = useMemo(() => {
    const filtered = assignments.filter(a => {
      if (a.scheduleDay === undefined || a.scheduleDay === null || a.scheduleDay < 0) return false;
      if (selectedModulo !== 'all' && String(a.modulo) !== selectedModulo) return false;
      return true;
    });

    const result: Array<{
      id: string;
      scheduleDay: number;
      startTime: string;
      endTime: string;
      subjectName: string;
      subjectCode: string;
      classroom: string;
      modulo: number;
      cuatrimestre: number;
      isFusion: boolean;
      groupsList: Array<{ groupName: string; careerName: string }>;
    }> = [];

    const fusionMap = new Map<string, any[]>();
    const standalone: any[] = [];

    filtered.forEach(item => {
      if (item.fusionGroupId) {
        if (!fusionMap.has(item.fusionGroupId)) fusionMap.set(item.fusionGroupId, []);
        fusionMap.get(item.fusionGroupId)!.push(item);
      } else {
        standalone.push([item]);
      }
    });

    const allGroups = [...standalone, ...Array.from(fusionMap.values())];

    allGroups.forEach((grp, idx) => {
      const first = grp[0];
      result.push({
        id: first.id || `cls-${idx}`,
        scheduleDay: first.scheduleDay,
        startTime: first.startTime || '08:00',
        endTime: first.endTime || '09:30',
        subjectName: first.subject?.name || 'Materia Asignada',
        subjectCode: first.subject?.code || '',
        classroom: first.classroom || 'Sin aula asignada',
        modulo: first.modulo || 1,
        cuatrimestre: first.cuatrimestre || cuatrimestre || 1,
        isFusion: grp.length > 1,
        groupsList: grp.map((g: any) => ({
          groupName: g.group?.name || 'Grupo',
          careerName: g.group?.career?.name || 'Licenciatura',
        })),
      });
    });

    // Ordenar por día (0=Lunes ... 6=Domingo) y luego por hora de inicio
    return result.sort((a, b) => {
      if (a.scheduleDay !== b.scheduleDay) return a.scheduleDay - b.scheduleDay;
      return a.startTime.localeCompare(b.startTime);
    });
  }, [assignments, selectedModulo, cuatrimestre]);

  // Agrupar por día de la semana (solo días que tienen al menos 1 clase)
  const classesByDay = useMemo(() => {
    const map = new Map<number, typeof consolidatedClasses>();
    consolidatedClasses.forEach(cls => {
      if (!map.has(cls.scheduleDay)) map.set(cls.scheduleDay, []);
      map.get(cls.scheduleDay)!.push(cls);
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [consolidatedClasses]);

  // Calcular total de horas semanales
  const totalWeeklyHours = useMemo(() => {
    let totalMinutes = 0;
    consolidatedClasses.forEach(cls => {
      const [sh, sm] = (cls.startTime || '00:00').split(':').map(Number);
      const [eh, em] = (cls.endTime || '00:00').split(':').map(Number);
      const diff = eh * 60 + em - (sh * 60 + sm);
      if (diff > 0) totalMinutes += diff;
    });
    const hours = Math.round((totalMinutes / 60) * 10) / 10;
    return hours;
  }, [consolidatedClasses]);

  const activeDaysNames = useMemo(() => {
    return classesByDay.map(([dayIdx]) => DAYS_OF_WEEK[dayIdx]).join(', ');
  }, [classesByDay]);

  const formattedPrintDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('es-MX', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(new Date());
    } catch {
      return new Date().toLocaleDateString('es-MX');
    }
  }, []);

  return (
    <div>
      {/* ===================================================================== */}
      {/* INTERFAZ WEB INTERACTIVA (SE OCULTA AUTOMÁTICAMENTE AL IMPRIMIR)      */}
      {/* ===================================================================== */}
      <div className="space-y-6 print:hidden">
        {/* Tarjetas de Resumen Rápido */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#061266] flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Materias Asignadas
              </p>
              <p className="text-2xl font-black text-gray-900">
                {consolidatedClasses.length}{' '}
                <span className="text-sm font-medium text-gray-500">
                  {consolidatedClasses.length === 1 ? 'clase' : 'clases'}
                </span>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Carga Semanal
              </p>
              <p className="text-2xl font-black text-gray-900">
                {totalWeeklyHours}{' '}
                <span className="text-sm font-medium text-gray-500">horas / semana</span>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Días de Clase
              </p>
              <p className="text-base font-extrabold text-gray-900 leading-snug">
                {activeDaysNames || 'Sin días asignados'}
              </p>
            </div>
          </div>
        </div>

        {/* Barra de Controles: Filtro de Módulo, Cambio de Vista e Impresión */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase mr-1">Módulo:</span>
            {[
              { id: 'all', label: 'Todos' },
              { id: '1', label: 'Módulo 1' },
              { id: '2', label: 'Módulo 2' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedModulo(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedModulo === tab.id
                    ? 'bg-[#061266] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('agenda')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'agenda'
                    ? 'bg-white text-[#061266] shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                Por Día (Fácil lectura)
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-[#061266] shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                Tabla Resumen
              </button>
            </div>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir Formato Oficial
            </button>
          </div>
        </div>

        {/* CONTENIDO DEL HORARIO EN PANTALLA */}
        {consolidatedClasses.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-700">
              No tienes clases registradas en este filtro
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Prueba seleccionando "Todos" en el filtro de Módulo arriba.
            </p>
          </div>
        ) : viewMode === 'agenda' ? (
          /* VISTA 1: AGENDA CLARA POR DÍA (SÚPER ENTENDIBLE) */
          <div className="space-y-6">
            {classesByDay.map(([dayIndex, dayClasses]) => {
              const dayName = DAYS_OF_WEEK[dayIndex] || 'Día';

              return (
                <div
                  key={dayIndex}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200/90 overflow-hidden"
                >
                  {/* Cabecera del Día */}
                  <div className="bg-gradient-to-r from-[#061266] to-blue-900 text-white px-6 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center font-bold text-sm text-[#fdb515]">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <h3 className="font-extrabold text-base tracking-wide uppercase">
                        {dayName}
                      </h3>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/15 text-blue-100">
                      {dayClasses.length} {dayClasses.length === 1 ? 'clase programada' : 'clases programadas'}
                    </span>
                  </div>

                  {/* Lista de Clases de ese Día */}
                  <div className="divide-y divide-gray-100">
                    {dayClasses.map(cls => (
                      <div
                        key={cls.id}
                        className="p-5 hover:bg-blue-50/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        {/* 1. Horario Grande y Claro */}
                        <div className="flex items-center gap-4 md:w-56 shrink-0">
                          <div className="px-4 py-3 rounded-xl bg-blue-50 border border-blue-200/80 text-center min-w-[150px]">
                            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-blue-600 uppercase mb-0.5">
                              <Clock className="w-3.5 h-3.5" />
                              Horario
                            </div>
                            <div className="font-mono font-black text-base text-[#061266]">
                              {cls.startTime} - {cls.endTime}
                            </div>
                          </div>
                        </div>

                        {/* 2. Materia, Carrera y Grupo */}
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-extrabold text-gray-900">
                              {cls.subjectName}
                            </h4>
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                              Módulo {cls.modulo}
                            </span>
                            {cls.isFusion && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                <Link2 className="w-3 h-3" />
                                Clase Fusionada ({cls.groupsList.length} grupos)
                              </span>
                            )}
                          </div>

                          {/* Grupos y Carreras */}
                          <div className="flex flex-wrap gap-2 pt-0.5">
                            {cls.groupsList.map((g, gIdx) => (
                              <div
                                key={gIdx}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg border border-gray-200"
                              >
                                <Users className="w-3.5 h-3.5 text-blue-600" />
                                <span>Grupo: <strong className="text-[#061266]">{g.groupName}</strong></span>
                                <span className="text-gray-400">·</span>
                                <span className="text-gray-600">{g.careerName}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 3. Aula Asignada */}
                        <div className="md:text-right shrink-0">
                          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div className="text-left">
                              <span className="text-[10px] font-bold uppercase text-emerald-600 block leading-none">
                                Salón / Aula
                              </span>
                              <span className="text-sm font-black">{cls.classroom}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* VISTA 2: TABLA RESUMEN COMPACTA Y DIRECTA */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-[#061266] text-white text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-5">Día</th>
                    <th className="py-3.5 px-4">Horario</th>
                    <th className="py-3.5 px-5">Materia</th>
                    <th className="py-3.5 px-5">Grupo y Carrera</th>
                    <th className="py-3.5 px-4 text-center">Módulo</th>
                    <th className="py-3.5 px-5 text-right">Aula</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {consolidatedClasses.map(cls => (
                    <tr key={cls.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3.5 px-5 font-extrabold text-[#061266] uppercase text-xs">
                        {DAYS_OF_WEEK[cls.scheduleDay]}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-800 text-xs whitespace-nowrap">
                        {cls.startTime} - {cls.endTime}
                      </td>
                      <td className="py-3.5 px-5 font-bold text-gray-900">
                        {cls.subjectName}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex flex-wrap gap-1.5">
                          {cls.groupsList.map((g, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 text-xs bg-gray-100 px-2.5 py-0.5 rounded-md font-semibold text-gray-700"
                            >
                              <strong>{g.groupName}</strong> ({g.careerName})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                          Módulo {cls.modulo}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono font-bold text-emerald-700">
                        {cls.classroom}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* FORMATO INSTITUCIONAL EXCLUSIVO DE IMPRESIÓN (1 SOLA HOJA A4/CARTA)   */}
      {/* ===================================================================== */}
      <div
        className="hidden print:block w-full bg-white text-black font-sans"
        style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
      >
        {/* 1. Membrete Institucional */}
        <div className="flex items-center justify-between border-b-2 border-[#061266] pb-3 mb-4">
          <div className="flex items-center gap-3.5">
            <div className="bg-[#061266] px-3 py-2 rounded-lg flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Universidad Aztlán"
                className="h-9 w-auto brightness-0 invert object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tight text-[#061266] leading-tight">
                Universidad Aztlán — Campus Playa del Carmen
              </h1>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-600 mt-0.5">
                Coordinación Académica · Formato Oficial de Carga Horaria Docente
              </p>
            </div>
          </div>

          <div className="text-right border border-gray-300 rounded-md px-3 py-1.5 bg-gray-50">
            <div className="text-[10px] font-bold uppercase text-gray-500">
              Ciclo Escolar: <span className="text-black font-black">{academicYear || '2026-2027'}</span>
            </div>
            <div className="text-[10px] font-bold uppercase text-gray-500">
              Fecha de emisión: <span className="text-black font-semibold">{formattedPrintDate}</span>
            </div>
          </div>
        </div>

        {/* 2. Ficha Técnica del Docente (Tabla Formal de Datos Generales) */}
        <table className="w-full border-collapse border border-gray-400 text-xs mb-5">
          <tbody>
            <tr>
              <td className="border border-gray-400 bg-gray-100 font-bold uppercase px-3 py-2 w-[18%] text-gray-700">
                Nombre del Docente:
              </td>
              <td className="border border-gray-400 px-3 py-2 font-black uppercase text-sm text-[#061266] w-[42%]">
                {teacherName}
              </td>
              <td className="border border-gray-400 bg-gray-100 font-bold uppercase px-3 py-2 w-[20%] text-gray-700">
                Periodo / Filtro:
              </td>
              <td className="border border-gray-400 px-3 py-2 font-bold text-gray-900 w-[20%]">
                {selectedModulo === 'all' ? 'Módulo 1 y 2 (Completo)' : `Módulo ${selectedModulo}`}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-400 bg-gray-100 font-bold uppercase px-3 py-2 text-gray-700">
                Días de Impartición:
              </td>
              <td className="border border-gray-400 px-3 py-2 font-bold text-gray-900">
                {activeDaysNames || 'Sin días asignados'}
              </td>
              <td className="border border-gray-400 bg-gray-100 font-bold uppercase px-3 py-2 text-gray-700">
                Carga Semanal Total:
              </td>
              <td className="border border-gray-400 px-3 py-2 font-black text-gray-900">
                {consolidatedClasses.length} {consolidatedClasses.length === 1 ? 'asignatura' : 'asignaturas'} ({totalWeeklyHours} hrs/sem)
              </td>
            </tr>
          </tbody>
        </table>

        {/* 3. Tabla Oficial de Horario de Clases (Sin scrollbars, 100% ancho de página) */}
        <div className="mb-6">
          <div className="bg-[#061266] text-white px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider border border-[#061266] border-b-0 flex items-center justify-between">
            <span>Desglose Oficial de Asignaturas y Horarios</span>
            <span className="text-[10px] font-semibold text-[#fdb515]">
              Documento de Control Académico
            </span>
          </div>
          <table className="w-full border-collapse border border-gray-400 text-xs">
            <thead>
              <tr className="bg-gray-100 text-gray-800 uppercase text-[10px] font-extrabold tracking-wider">
                <th className="border border-gray-400 py-2 px-2 text-center w-[5%]">N°</th>
                <th className="border border-gray-400 py-2 px-2.5 text-left w-[12%]">Día</th>
                <th className="border border-gray-400 py-2 px-2.5 text-center w-[16%]">Horario</th>
                <th className="border border-gray-400 py-2 px-3 text-left w-[29%]">Asignatura</th>
                <th className="border border-gray-400 py-2 px-3 text-left w-[22%]">Grupo y Licenciatura</th>
                <th className="border border-gray-400 py-2 px-2 text-center w-[8%]">Módulo</th>
                <th className="border border-gray-400 py-2 px-2 text-center w-[8%]">Aula</th>
              </tr>
            </thead>
            <tbody>
              {consolidatedClasses.map((cls, index) => (
                <tr key={cls.id} className="even:bg-gray-50/60 avoid-break">
                  <td className="border border-gray-400 py-2.5 px-2 text-center font-bold text-gray-600">
                    {index + 1}
                  </td>
                  <td className="border border-gray-400 py-2.5 px-2.5 font-extrabold uppercase text-[#061266]">
                    {DAYS_OF_WEEK[cls.scheduleDay]}
                  </td>
                  <td className="border border-gray-400 py-2.5 px-2.5 text-center font-mono font-bold text-gray-900 whitespace-nowrap">
                    {cls.startTime} - {cls.endTime}
                  </td>
                  <td className="border border-gray-400 py-2.5 px-3">
                    <div className="font-extrabold text-gray-900 uppercase leading-snug">
                      {cls.subjectName}
                    </div>
                    {cls.isFusion && (
                      <div className="text-[10px] font-bold text-amber-800 mt-0.5">
                        * Clase Fusionada ({cls.groupsList.length} grupos simultáneos)
                      </div>
                    )}
                  </td>
                  <td className="border border-gray-400 py-2.5 px-3">
                    <div className="space-y-1">
                      {cls.groupsList.map((g, i) => (
                        <div key={i} className="leading-tight">
                          <span className="font-black text-[#061266]">{g.groupName}</span>{' '}
                          <span className="text-gray-700 font-medium">({g.careerName})</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="border border-gray-400 py-2.5 px-2 text-center font-bold text-gray-800">
                    Mód. {cls.modulo}
                  </td>
                  <td className="border border-gray-400 py-2.5 px-2 text-center font-bold text-gray-900">
                    {cls.classroom === 'Sin aula asignada' ? 'Por asignar' : cls.classroom}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 4. Nota de Responsabilidad y Firmas de Conformidad */}
        <div className="mt-4 pt-2 avoid-break">
          <p className="text-[10px] text-gray-600 leading-relaxed text-justify mb-10">
            <strong>NOTA INSTITUCIONAL:</strong> El presente formato oficial ampara la asignación de carga académica para el ciclo escolar{' '}
            <strong>{academicYear || '2026-2027'}</strong>. El docente se compromete a cumplir puntualmente con los días, horarios y aulas aquí establecidos. Cualquier cambio o permuta de horario deberá contar con autorización previa por escrito de la Coordinación Académica.
          </p>

          <div className="grid grid-cols-2 gap-16 px-8 mt-12">
            <div className="text-center">
              <div className="border-t border-gray-800 pt-2">
                <p className="text-xs font-extrabold uppercase text-gray-900">
                  Coordinación Académica
                </p>
                <p className="text-[10px] text-gray-600 font-medium">
                  Universidad Aztlán · Sello y Firma de Autorización
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="border-t border-gray-800 pt-2">
                <p className="text-xs font-extrabold uppercase text-gray-900">
                  {teacherName}
                </p>
                <p className="text-[10px] text-gray-600 font-medium">
                  Firma de Enterado y Conformidad del Docente
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-2 border-t border-gray-200 flex items-center justify-between text-[9px] text-gray-400">
            <span>Sistema de Gestión Académica — Universidad Aztlán Playa del Carmen</span>
            <span>Página 1 de 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
