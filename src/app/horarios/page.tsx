'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Button, Badge, Modal, Input } from '@/components/ui';
import { Select } from '@/components/ui/Select';
import { PrintGroups } from '@/components/horarios/PrintGroups';
import { cn } from '@/lib/utils';
import {
  MOCK_SUBJECTS,
  MOCK_GROUPS,
  DAYS_OF_WEEK,
  CUATRIMESTRES,
  MOCK_ACADEMIC_LEVELS,
  MOCK_CAREERS,
  MOCK_BIMESTRES,
  MOCK_YEARS,
  TIME_SLOTS,
  getSubjectById,
  getGroupById,
  MOCK_GROUP_TEMPLATES,
  type MockScheduleAssignment,
} from '@/lib/mockData';

// Colores por maestro para la vista semanal
const TEACHER_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'mock-t1': { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-800' },
  'mock-t2': { bg: 'bg-emerald-100', border: 'border-emerald-400', text: 'text-emerald-800' },
  'mock-t3': { bg: 'bg-amber-100', border: 'border-amber-400', text: 'text-amber-800' },
};

function getTeacherColor(teacherId: string) {
  return TEACHER_COLORS[teacherId] || { bg: 'bg-gray-100', border: 'border-gray-400', text: 'text-gray-800' };
}

export default function HorariosPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'week'>('week');
  const [filterTeacher, setFilterTeacher] = useState<string>('');
  const [filterGroup, setFilterGroup] = useState<string>('');

  // Datos agrupados para los selects en línea
  const groupedSubjects = useMemo(() => {
    const map = new Map<string, typeof MOCK_SUBJECTS>();
    MOCK_SUBJECTS.forEach(s => {
      const career = MOCK_CAREERS.find(c => c.id === s.careerId);
      const level = career ? MOCK_ACADEMIC_LEVELS.find(l => l.id === career.academicLevelId) : null;
      const key = career ? `${level?.name} - ${career.name}` : 'Materias Generales';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    });
    return Array.from(map.entries());
  }, []);

  const groupedGroups = useMemo(() => {
    const map = new Map<string, typeof MOCK_GROUPS>();
    MOCK_GROUPS.forEach(g => {
      const career = MOCK_CAREERS.find(c => c.id === g.carreraId);
      const level = career ? MOCK_ACADEMIC_LEVELS.find(l => l.id === career.academicLevelId) : null;
      const key = career ? `${level?.name} - ${career.name}` : 'Grupos Generales';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(g);
    });
    return Array.from(map.entries());
  }, []);

  // Calcular las opciones de plantillas pendientes
  const availableTemplateSlots = useMemo(() => {
    const options: any[] = [];
    
    MOCK_GROUP_TEMPLATES.forEach(tpl => {
      const group = getGroupById(tpl.groupId);
      if (!group) return;

      const career = MOCK_CAREERS.find(c => c.id === group.carreraId);
      const level = career ? MOCK_ACADEMIC_LEVELS.find(l => l.id === career.academicLevelId) : null;
      const groupName = career ? `${level?.name} - ${career.name}` : 'Generales';

      tpl.subjectIds.forEach(subjectId => {
        // Verificar si esta materia de esta plantilla ya está asignada en assignments
        const isAssigned = assignments.some(a => 
          a.groupId === tpl.groupId &&
          a.modulo === tpl.modulo &&
          a.subjectId === subjectId &&
          a.teacherId && a.teacherId !== 'mock-t-unassigned'
        );

        if (!isAssigned) {
          const subject = getSubjectById(subjectId);
          options.push({
            id: `${tpl.id}_${subjectId}`,
            label: `Mód ${tpl.modulo} | ${group.name} - ${subject?.name} (${tpl.classroom})`,
            groupCategory: groupName,
            tpl,
            subjectId
          });
        }
      });
    });

    // Agrupar las opciones por categoría de carrera
    const grouped = new Map<string, typeof options>();
    options.forEach(opt => {
      if (!grouped.has(opt.groupCategory)) grouped.set(opt.groupCategory, []);
      grouped.get(opt.groupCategory)!.push(opt);
    });

    return Array.from(grouped.entries());
  }, [assignments]);

  useEffect(() => {
    fetch('/api/teachers')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTeachers(data.data);
        }
      })
      .catch(err => console.error("Error fetching teachers", err))
      .finally(() => setLoadingTeachers(false));

    fetch('/api/assignments')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAssignments(data.data);
        }
      })
      .catch(err => console.error("Error fetching assignments", err));
  }, []);

  const getTeacherById = (id: string) => teachers.find((t) => t.id === id);
  const getActiveTeachers = () => teachers.filter((t) => t.contractStatus === 'active');

  // Estado del formulario de nueva asignación
  const [formData, setFormData] = useState({
    teacherId: '',
    templateSlotId: '',
    scheduleDay: '',
    startTime: '',
    endTime: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Filtrar asignaciones
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      if (filterTeacher && a.teacherId !== filterTeacher) return false;
      if (filterGroup && a.groupId !== filterGroup) return false;
      return true;
    });
  }, [assignments, filterTeacher, filterGroup]);

  // Verificar conflictos de horario
  const checkConflict = (newAssignment: Omit<MockScheduleAssignment, 'id'>): string | null => {
    // 1. Validar que el maestro marcó este horario como disponible
    const isAvailable = assignments.some(a => 
      a.teacherId === newAssignment.teacherId &&
      a.scheduleDay === newAssignment.scheduleDay &&
      a.startTime <= newAssignment.startTime &&
      a.endTime >= newAssignment.endTime &&
      a.isAvailable === true
    );

    if (!isAvailable) {
      return 'El docente tiene horario en otra universidad o no está disponible en este horario.';
    }

    for (const existing of assignments) {
      // Si ya hay otra materia asignada al mismo maestro en esa hora (que no sea un slot de disponibilidad en blanco)
      if (
        existing.teacherId === newAssignment.teacherId &&
        existing.scheduleDay === newAssignment.scheduleDay &&
        existing.groupId !== 'mock-g1' // Asumiendo que 'mock-g1' es el default de disponibilidad no asignada
      ) {
        if (newAssignment.startTime < existing.endTime && newAssignment.endTime > existing.startTime) {
          const teacher = getTeacherById(existing.teacherId);
          return `Conflicto: ${teacher?.firstName} ${teacher?.lastName} ya tiene una clase asignada de ${existing.startTime} a ${existing.endTime} el ${DAYS_OF_WEEK[existing.scheduleDay]}`;
        }
      }
      
      // Verificar conflicto de grupo
      if (
        existing.groupId === newAssignment.groupId &&
        existing.scheduleDay === newAssignment.scheduleDay &&
        existing.groupId !== 'mock-g1' &&
        !existing.isAvailable
      ) {
        if (newAssignment.startTime < existing.endTime && newAssignment.endTime > existing.startTime) {
          const group = getGroupById(existing.groupId);
          return `Conflicto: El grupo ${group?.name} ya tiene clase de ${existing.startTime} a ${existing.endTime} el ${DAYS_OF_WEEK[existing.scheduleDay]}`;
        }
      }

      // Verificar conflicto de aula (Control Físico de Aulas)
      if (
        newAssignment.classroom &&
        existing.classroom === newAssignment.classroom &&
        existing.scheduleDay === newAssignment.scheduleDay &&
        !existing.isAvailable
      ) {
        if (newAssignment.startTime < existing.endTime && newAssignment.endTime > existing.startTime) {
          return `Conflicto de Aula: El ${newAssignment.classroom} ya está ocupado de ${existing.startTime} a ${existing.endTime} el ${DAYS_OF_WEEK[existing.scheduleDay]}.`;
        }
      }
    }
    return null;
  };

  const handleSubmit = () => {
    setFormError(null);

    // Validar campos
    if (!formData.teacherId || !formData.templateSlotId || 
        formData.scheduleDay === '' || !formData.startTime || !formData.endTime) {
      setFormError('Todos los campos marcados con * son obligatorios');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      setFormError('La hora de inicio debe ser anterior a la hora de fin');
      return;
    }

    const [tplId, subjectId] = formData.templateSlotId.split('_');
    const tpl = MOCK_GROUP_TEMPLATES.find(t => t.id === tplId);
    
    if (!tpl) {
      setFormError('Plantilla inválida');
      return;
    }

    const newAssignment: MockScheduleAssignment = {
      id: `mock-a${Date.now()}`,
      teacherId: formData.teacherId,
      subjectId: subjectId,
      groupId: tpl.groupId,
      scheduleDay: parseInt(formData.scheduleDay),
      startTime: formData.startTime,
      endTime: formData.endTime,
      classroom: tpl.classroom,
      modulo: tpl.modulo
    };

    // Verificar conflictos
    const conflict = checkConflict(newAssignment);
    if (conflict) {
      setFormError(conflict);
      return;
    }

    setAssignments([...assignments, newAssignment]);
    setIsFormOpen(false);
    setFormData({
      teacherId: '',
      templateSlotId: '',
      scheduleDay: '',
      startTime: '',
      endTime: '',
    });
  };

  const getSuggestedTeachers = () => {
    if (formData.scheduleDay === '' || !formData.startTime || !formData.endTime) return [];
    
    return activeTeachers.filter(t => {
      // 1. Check if teacher marked this time as available
      const hasAvailability = assignments.some(a => 
        a.teacherId === t.id && 
        a.isAvailable && 
        a.scheduleDay === parseInt(formData.scheduleDay) &&
        a.startTime <= formData.startTime && 
        a.endTime >= formData.endTime
      );
      if (!hasAvailability) return false;

      // 2. Check if teacher is already booked
      const isBooked = assignments.some(a => 
        a.teacherId === t.id && 
        !a.isAvailable && 
        a.scheduleDay === parseInt(formData.scheduleDay) &&
        a.subjectId !== 'mock-s1' && // ignore mock-s1 availability slots
        !(formData.endTime <= a.startTime || formData.startTime >= a.endTime)
      );
      if (isBooked) return false;

      return true;
    });
  };

  const suggestedTeachers = getSuggestedTeachers();

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta asignación?')) {
      setAssignments(assignments.filter((a) => a.id !== id));
    }
  };

  // Vista semanal: agrupar asignaciones por día y hora
  const weekHours = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

  const getAssignmentForSlot = (day: number, hour: string) => {
    return filteredAssignments.filter((a) => {
      return a.scheduleDay === day && a.startTime <= hour && a.endTime > hour;
    });
  };

  const activeTeachers = getActiveTeachers();

  return (
    <>
    <div className="min-h-screen bg-transparent p-6 print:hidden">
      <div className="max-w-7xl mx-auto">
        {/* Botón Regresar */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-6 transition-colors group"
        >
          <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
          Regresar al inicio
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#061266]">📅 Gestión de Horarios</h1>
            <p className="text-gray-600 mt-2">
              Asigna horarios vinculando Maestro → Materia → Grupo. Se validan conflictos automáticamente.
            </p>
          </div>
          </div>
          <div className="flex gap-4">
            <Button
              size="lg"
              variant="outline"
              onClick={() => window.print()}
              className="shadow-sm border-blue-600 text-blue-600 hover:bg-blue-50 flex items-center gap-2"
            >
              📄 Generar PDFs (Grupos)
            </Button>
            <Button
              size="lg"
              onClick={() => setIsFormOpen(true)}
              className="shadow-lg"
            >
              + Nueva Asignación
            </Button>
          </div>
        </div>

        {/* Filtros y controles */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Toggle de vista */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('week')}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors',
                  viewMode === 'week'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                )}
              >
                📅 Vista Semanal
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors',
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                )}
              >
                📋 Vista Tabla
              </button>
            </div>

            {/* Filtros */}
            <select
              value={filterTeacher}
              onChange={(e) => setFilterTeacher(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los maestros</option>
              {teachers.filter(t => t.contractStatus !== 'inactive').map((t) => (
                <option key={t.id} value={t.id}>
                  {t.firstName} {t.lastName}
                </option>
              ))}
            </select>

            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los grupos</option>
              {groupedGroups.map(([groupName, groups]) => (
                <optgroup key={groupName} label={groupName}>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            {(filterTeacher || filterGroup) && (
              <button
                onClick={() => { setFilterTeacher(''); setFilterGroup(''); }}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                ✕ Limpiar filtros
              </button>
            )}

            {/* Contador */}
            <span className="text-sm text-gray-500 ml-auto">
              {filteredAssignments.length} asignación{filteredAssignments.length !== 1 ? 'es' : ''}
            </span>
          </div>
        </div>

        {/* ============ VISTA SEMANAL ============ */}
        {viewMode === 'week' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-3 text-left font-semibold text-gray-600 w-20 sticky left-0 bg-gray-50">
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
                      <td className="px-3 py-3 text-gray-500 font-mono text-xs font-semibold sticky left-0 bg-white border-r border-gray-100">
                        {hour}
                      </td>
                      {DAYS_OF_WEEK.map((_, dayIndex) => {
                        const slotAssignments = getAssignmentForSlot(dayIndex, hour);
                        return (
                          <td key={dayIndex} className="px-1 py-1 align-top">
                            {slotAssignments.map((a) => {
                              const teacher = getTeacherById(a.teacherId);
                              const subject = getSubjectById(a.subjectId);
                              const group = getGroupById(a.groupId);
                              const colors = getTeacherColor(a.teacherId);
                              // Solo mostrar en la primera hora del bloque
                              if (a.startTime !== hour) return null;
                              return (
                                <div
                                  key={a.id}
                                  className={cn(
                                    'rounded-lg border-l-4 px-2 py-1.5 mb-1 cursor-default',
                                    colors.bg, colors.border
                                  )}
                                  title={`${teacher?.firstName} ${teacher?.lastName} — ${subject?.name} — ${group?.name}\n${a.startTime} - ${a.endTime}${a.classroom ? `\nAula: ${a.classroom}` : ''}`}
                                >
                                  <p className={cn('font-semibold text-xs leading-tight', colors.text)}>
                                    {subject?.name}
                                  </p>
                                  <p className="text-[11px] text-gray-600 leading-tight mt-0.5">
                                    {teacher?.firstName} {teacher?.lastName?.charAt(0)}.
                                  </p>
                                  <p className="text-[11px] text-gray-500 leading-tight">
                                    {group?.name} · {a.startTime}-{a.endTime}
                                  </p>
                                  {a.classroom && (
                                    <p className="text-[10px] text-gray-400 leading-tight">
                                      📍 {a.classroom}
                                    </p>
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

            {/* Leyenda de colores */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 border-t border-gray-200">
              <span className="text-xs font-semibold text-gray-500 uppercase">Maestros:</span>
              {teachers.filter(t => t.contractStatus !== 'inactive').map((t) => {
                const colors = getTeacherColor(t.id);
                return (
                  <div key={t.id} className="flex items-center gap-1.5">
                    <span className={cn('w-3 h-3 rounded-sm border-l-2', colors.bg, colors.border)} />
                    <span className="text-xs text-gray-600">{t.firstName} {t.lastName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============ VISTA TABLA ============ */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {!filterTeacher ? (
              <div className="p-12 text-center">
                <p className="text-gray-500 mb-2 text-lg">Por favor selecciona un maestro en los filtros de arriba.</p>
                <p className="text-sm text-gray-400">Podrás visualizar su disponibilidad y asignarle materias, grupos y aulas.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b border-gray-300">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Día</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Horario</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 w-1/4">Materia</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 w-1/4">Grupo</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 w-1/6">Aula</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssignments.filter(a => a.isAvailable).length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-12 text-center text-gray-500 bg-gray-50">
                          Este docente no ha enviado su disponibilidad o no tiene horarios registrados.
                        </td>
                      </tr>
                    ) : (
                      [...filteredAssignments]
                        .filter(a => a.isAvailable)
                        .sort((a, b) => a.scheduleDay - b.scheduleDay || a.startTime.localeCompare(b.startTime))
                        .map((a) => {
                          const isAssigned = a.subjectId && a.subjectId !== 'mock-s1';
                          const assignedSubject = isAssigned ? getSubjectById(a.subjectId) : null;
                          const assignedGroup = isAssigned ? getGroupById(a.groupId) : null;

                          return (
                            <tr key={a.id} className="border-b border-gray-200 bg-[#5cdb5c]/20 hover:bg-[#5cdb5c]/40 transition-colors">
                              <td className="px-4 py-4 font-bold text-emerald-900 uppercase w-[15%]">
                                {DAYS_OF_WEEK[a.scheduleDay]}
                              </td>
                              <td className="px-4 py-4 text-emerald-800 font-mono font-semibold w-[20%]">
                                {a.startTime} — {a.endTime}
                              </td>
                              <td colSpan={3} className="px-4 py-2 w-[65%]">
                                <select
                                  className="w-full px-2 py-2 border border-emerald-400 rounded bg-white text-gray-800 text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                                  value={isAssigned ? "assigned" : ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const newAsg = [...assignments];
                                    const index = newAsg.findIndex(asg => asg.id === a.id);
                                    if(index !== -1) {
                                      if (val === "") {
                                        // Desasignar
                                        newAsg[index].subjectId = '';
                                        newAsg[index].groupId = '';
                                        newAsg[index].classroom = '';
                                        newAsg[index].modulo = undefined;
                                      } else {
                                        // Asignar de plantilla
                                        const [tplId, subjId] = val.split('_');
                                        const tpl = MOCK_GROUP_TEMPLATES.find(t => t.id === tplId);
                                        if (tpl) {
                                          newAsg[index].subjectId = subjId;
                                          newAsg[index].groupId = tpl.groupId;
                                          newAsg[index].classroom = tpl.classroom;
                                          newAsg[index].modulo = tpl.modulo;
                                        }
                                      }
                                      setAssignments(newAsg);
                                    }
                                  }}
                                >
                                  {isAssigned ? (
                                    <>
                                      <option value="assigned">
                                        Mód {a.modulo} | {assignedGroup?.name} - {assignedSubject?.name} ({a.classroom})
                                      </option>
                                      <option value="">-- Desasignar / Liberar Horario --</option>
                                    </>
                                  ) : (
                                    <>
                                      <option value="">-- Asignar desde Plantilla Pendiente --</option>
                                      {availableTemplateSlots.map(([groupName, options]) => (
                                        <optgroup key={groupName} label={groupName}>
                                          {options.map((opt: any) => (
                                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                                          ))}
                                        </optgroup>
                                      ))}
                                    </>
                                  )}
                                </select>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Resumen de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-blue-500">
            <p className="text-sm font-medium text-gray-500">Total de Maestros</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{teachers.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-emerald-500">
            <p className="text-sm font-medium text-gray-500">Maestros con Horarios</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {new Set(assignments.filter(a => a.isAvailable).map(a => a.teacherId)).size}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-purple-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Aulas Asignadas</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {new Set(assignments.filter(a => a.classroom).map(a => a.classroom)).size} <span className="text-xl text-gray-400">/ 10</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 font-medium">AULAS PENDIENTES</p>
                <p className="text-xs text-amber-600 mt-0.5">Pendiente de BD</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ MODAL: Nueva Asignación ============ */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setFormError(null); }}
        title="Nueva Asignación de Horario"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setIsFormOpen(false); setFormError(null); }}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              Crear Asignación
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm">
              ⚠️ {formError}
            </div>
          )}

          {/* Maestro */}
          <div>
            <div className="flex justify-between items-end mb-1">
              <label className="block text-sm font-medium text-gray-700">Maestro *</label>
              {formData.scheduleDay !== '' && formData.startTime && formData.endTime && (
                <button
                  type="button"
                  onClick={() => {
                    if (suggestedTeachers.length > 0) {
                      setFormData(prev => ({ ...prev, teacherId: suggestedTeachers[0].id }));
                    } else {
                      setFormError('No hay maestros disponibles para este horario.');
                    }
                  }}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-2 py-1 rounded"
                >
                  ✨ Sugerir Maestro
                </button>
              )}
            </div>
            <select
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar maestro...</option>
              {suggestedTeachers.length > 0 && formData.scheduleDay !== '' && (
                <optgroup label="✅ Maestros Disponibles (Sugeridos)">
                  {suggestedTeachers.map(t => (
                    <option key={`sug-${t.id}`} value={t.id}>
                      {t.firstName} {t.lastName} — {t.specialization}
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label="Todos los maestros">
                {activeTeachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName} — {t.specialization}
                  </option>
                ))}
              </optgroup>
            </select>
            {activeTeachers.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ No hay maestros activos. Ve a la sección de Maestros para activar alguno.
              </p>
            )}
          </div>

          {/* Plantilla */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Materia desde Plantilla *</label>
            <select
              value={formData.templateSlotId}
              onChange={(e) => setFormData({ ...formData, templateSlotId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar materia de plantilla...</option>
              {availableTemplateSlots.map(([groupName, options]) => (
                <optgroup key={groupName} label={groupName}>
                  {options.map((opt: any) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Día */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Día de la semana *</label>
            <select
              value={formData.scheduleDay}
              onChange={(e) => setFormData({ ...formData, scheduleDay: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar día...</option>
              {DAYS_OF_WEEK.map((day, i) => (
                <option key={i} value={i}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          {/* Horario */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora inicio *</label>
              <select
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Inicio...</option>
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora fin *</label>
              <select
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Fin...</option>
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
    
    <PrintGroups assignments={assignments} />
    </>
  );
}
