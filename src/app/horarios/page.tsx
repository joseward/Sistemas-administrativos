'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Button, Badge, Modal, Select, Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  MOCK_SUBJECTS,
  MOCK_GROUPS,
  DAYS_OF_WEEK,
  TIME_SLOTS,
  getSubjectById,
  getGroupById,
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
    subjectId: '',
    groupId: '',
    scheduleDay: '',
    startTime: '',
    endTime: '',
    classroom: '',
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
        existing.groupId !== 'mock-g1'
      ) {
        if (newAssignment.startTime < existing.endTime && newAssignment.endTime > existing.startTime) {
          const group = getGroupById(existing.groupId);
          return `Conflicto: El grupo ${group?.name} ya tiene clase de ${existing.startTime} a ${existing.endTime} el ${DAYS_OF_WEEK[existing.scheduleDay]}`;
        }
      }
    }
    return null;
  };

  const handleSubmit = () => {
    setFormError(null);

    // Validar campos
    if (!formData.teacherId || !formData.subjectId || !formData.groupId ||
        formData.scheduleDay === '' || !formData.startTime || !formData.endTime) {
      setFormError('Todos los campos marcados con * son obligatorios');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      setFormError('La hora de inicio debe ser anterior a la hora de fin');
      return;
    }

    const newAssignment: MockScheduleAssignment = {
      id: `mock-a${Date.now()}`,
      teacherId: formData.teacherId,
      subjectId: formData.subjectId,
      groupId: formData.groupId,
      scheduleDay: parseInt(formData.scheduleDay),
      startTime: formData.startTime,
      endTime: formData.endTime,
      classroom: formData.classroom || undefined,
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
      subjectId: '',
      groupId: '',
      scheduleDay: '',
      startTime: '',
      endTime: '',
      classroom: '',
    });
  };

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
    <div className="min-h-screen bg-transparent p-6">
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
          <Button
            size="lg"
            onClick={() => setIsFormOpen(true)}
            className="shadow-lg"
          >
            + Nueva Asignación
          </Button>
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
              {MOCK_GROUPS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
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
                        <td colSpan={5} className="px-4 py-12 text-center text-gray-500 bg-gray-50">
                          Este docente no ha enviado su disponibilidad o no tiene horarios registrados.
                        </td>
                      </tr>
                    ) : (
                      [...filteredAssignments]
                        .filter(a => a.isAvailable)
                        .sort((a, b) => a.scheduleDay - b.scheduleDay || a.startTime.localeCompare(b.startTime))
                        .map((a) => {
                          return (
                            <tr key={a.id} className="border-b border-gray-200 bg-[#5cdb5c]/20 hover:bg-[#5cdb5c]/40 transition-colors">
                              <td className="px-4 py-4 font-bold text-emerald-900 uppercase">
                                {DAYS_OF_WEEK[a.scheduleDay]}
                              </td>
                              <td className="px-4 py-4 text-emerald-800 font-mono font-semibold">
                                {a.startTime} — {a.endTime}
                              </td>
                              <td className="px-4 py-2">
                                <select
                                  className="w-full px-2 py-1.5 border border-emerald-300 rounded bg-white text-gray-800 text-xs focus:ring-2 focus:ring-emerald-500"
                                  value={a.subjectId && a.subjectId !== 'mock-s1' ? a.subjectId : ''}
                                  onChange={(e) => {
                                    const newAsg = [...assignments];
                                    const index = newAsg.findIndex(asg => asg.id === a.id);
                                    if(index !== -1) { newAsg[index].subjectId = e.target.value; setAssignments(newAsg); }
                                  }}
                                >
                                  <option value="">-- Seleccionar Materia --</option>
                                  {MOCK_SUBJECTS.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-2">
                                <select
                                  className="w-full px-2 py-1.5 border border-emerald-300 rounded bg-white text-gray-800 text-xs focus:ring-2 focus:ring-emerald-500"
                                  value={a.groupId && a.groupId !== 'mock-g1' ? a.groupId : ''}
                                  onChange={(e) => {
                                    const newAsg = [...assignments];
                                    const index = newAsg.findIndex(asg => asg.id === a.id);
                                    if(index !== -1) { newAsg[index].groupId = e.target.value; setAssignments(newAsg); }
                                  }}
                                >
                                  <option value="">-- Seleccionar Grupo --</option>
                                  {MOCK_GROUPS.map((g) => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="text"
                                  placeholder="Ej. Aula 101"
                                  className="w-full px-2 py-1.5 border border-emerald-300 rounded bg-white text-gray-800 text-xs focus:ring-2 focus:ring-emerald-500"
                                  value={a.classroom || ''}
                                  onChange={(e) => {
                                    const newAsg = [...assignments];
                                    const index = newAsg.findIndex(asg => asg.id === a.id);
                                    if(index !== -1) { newAsg[index].classroom = e.target.value; setAssignments(newAsg); }
                                  }}
                                />
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Maestro *</label>
            <select
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar maestro...</option>
              {activeTeachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.firstName} {t.lastName} — {t.specialization}
                </option>
              ))}
            </select>
            {activeTeachers.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ No hay maestros activos. Ve a la sección de Maestros para activar alguno.
              </p>
            )}
          </div>

          {/* Materia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Materia *</label>
            <select
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar materia...</option>
              {MOCK_SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Grupo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grupo *</label>
            <select
              value={formData.groupId}
              onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar grupo...</option>
              {MOCK_GROUPS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} — Grado {g.grade} ({g.totalStudents} alumnos)
                </option>
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

          {/* Aula */}
          <Input
            label="Aula / Salón (opcional)"
            placeholder="Ej: Aula 101, Lab. Ciencias"
            value={formData.classroom}
            onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
}
