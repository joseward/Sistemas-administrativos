'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button, Badge, Modal, Input } from '@/components/ui';
import { Select } from '@/components/ui/Select';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/Tooltip';
import { PrintGroups } from '@/components/horarios/PrintGroups';
import { PrintTeachers } from '@/components/horarios/PrintTeachers';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
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

function HorariosContent() {
  const searchParams = useSearchParams();
  const initialView = searchParams.get('view') as 'table' | 'week' | null;

  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [dbTemplates, setDbTemplates] = useState<any[]>([]);
  const [teacherAvailability, setTeacherAvailability] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Assign Preview State
  const [assignPreview, setAssignPreview] = useState<Omit<MockScheduleAssignment, 'id'> | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'week'>(initialView === 'table' ? 'table' : 'week');
  const [filterTeacher, setFilterTeacher] = useState<string>('');
  const [filterGroup, setFilterGroup] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [printMode, setPrintMode] = useState<'groups' | 'teachers'>('groups');
  const [printTargetId, setPrintTargetId] = useState<string | null>(null);

  // Datos agrupados para los selects en línea
  const groupedSubjects = useMemo(() => {
    const map = new Map<string, typeof subjects>();
    subjects.forEach(s => {
      const careerName = s.career?.name || 'Materias Generales';
      if (!map.has(careerName)) map.set(careerName, []);
      map.get(careerName)!.push(s);
    });
    return Array.from(map.entries());
  }, [subjects]);

  const getSubjectById = (id: string) => subjects.find(s => s.id === id);

  const groupedGroups = useMemo(() => {
    const map = new Map<string, typeof groups>();
    groups.forEach(g => {
      const careerName = g.career?.name || 'Grupos sin Carrera';
      if (!map.has(careerName)) map.set(careerName, []);
      map.get(careerName)!.push(g);
    });
    return Array.from(map.entries());
  }, [groups]);

  const getGroupById = (id: string) => groups.find((g) => g.id === id);

  // Calcular las opciones de plantillas pendientes
  const availableTemplateSlots = useMemo(() => {
    const options: any[] = [];
    
    const sourceTemplates = dbTemplates.length > 0 ? dbTemplates : MOCK_GROUP_TEMPLATES;

    sourceTemplates.forEach(tpl => {
      const group = getGroupById(tpl.groupId);
      if (!group) return;

      const careerName = group.career?.name;
      const groupName = careerName ? `${careerName}` : 'Generales';

      tpl.subjectIds.forEach((subjectId: string) => {
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
            label: `Mód ${tpl.modulo} | ${group.name} ${tpl.turno ? `(${tpl.turno})` : ''} - ${subject?.name} (${tpl.classroom})${tpl.startTime && tpl.endTime ? ` [${tpl.startTime}-${tpl.endTime}]` : ''}`,
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
  }, [assignments, groups, dbTemplates, subjects]);

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

    Promise.all([
      fetch('/api/assignments').then(res => res.json()),
      fetch('/api/availability').then(res => res.json()),
      fetch('/api/subjects').then(res => res.json()),
      fetch('/api/templates').then(res => res.json()),
      fetch('/api/groups').then(res => res.json())
    ])
    .then(([assignmentsRes, availabilityRes, subjectsData, templatesRes, groupsData]) => {
      if (Array.isArray(subjectsData)) setSubjects(subjectsData);
      if (templatesRes && !templatesRes.error) setDbTemplates(templatesRes);
      if (Array.isArray(groupsData)) setGroups(groupsData);
      
      let loaded: any[] = [];
      if (assignmentsRes.success) {
        loaded.push(...assignmentsRes.data);
      }
      setAssignments(loaded);

      if (availabilityRes.success) {
        setTeacherAvailability(availabilityRes.data);
      }
    })
    .catch(err => console.error("Error fetching schedule data", err));
  }, []);

  useEffect(() => {
    const handleStartTour = (e: any) => {
      if (e.detail.tourId === 'horarios-tour') {
        const driverObj = driver({
          showProgress: true,
          nextBtnText: 'Siguiente →',
          prevBtnText: '← Anterior',
          doneBtnText: '¡Entendido!',
          steps: [
            { element: '#filtros-horarios', popover: { title: 'Vista Inteligente', description: 'Usa los filtros para ver solo el horario de un maestro específico o de un grupo particular.', side: "bottom", align: 'start' }},
            { element: '#vistas-horarios', popover: { title: 'Cambio de Vista', description: 'Alterna entre la Vista Semanal (tipo calendario) y la Vista de Tabla clásica.', side: "bottom", align: 'start' }}
          ]
        });
        driverObj.drive();
      }
    };
    window.addEventListener('start-tour', handleStartTour);
    return () => window.removeEventListener('start-tour', handleStartTour);
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

  // Filtrar asignaciones
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      if (filterTeacher && a.teacherId !== filterTeacher) return false;
      if (filterGroup && a.groupId !== filterGroup) return false;
      return true;
    });
  }, [assignments, filterTeacher, filterGroup]);

  // Verificar conflictos de horario
  const checkConflict = (newAssignment: Omit<MockScheduleAssignment, 'id'>, checkList = assignments): string | null => {
    // 1. Validar que el maestro marcó este horario como disponible
    const isAvailable = teacherAvailability.some(av => 
      av.teacherId === newAssignment.teacherId &&
      av.dayOfWeek === newAssignment.scheduleDay &&
      av.startTime <= newAssignment.startTime &&
      av.endTime >= newAssignment.endTime
    );

    if (!isAvailable) {
      return 'El docente no está disponible en este horario completo o no ha marcado disponibilidad.';
    }

    for (const existing of checkList) {
      // Si ya hay otra materia asignada al mismo maestro en esa hora
      if (
        existing.teacherId === newAssignment.teacherId &&
        existing.scheduleDay === newAssignment.scheduleDay
      ) {
        if (newAssignment.startTime < existing.endTime && newAssignment.endTime > existing.startTime) {
          const teacher = getTeacherById(existing.teacherId);
          return `Conflicto: ${teacher?.firstName} ${teacher?.lastName} ya tiene una clase asignada de ${existing.startTime} a ${existing.endTime} el ${DAYS_OF_WEEK[existing.scheduleDay]}`;
        }
      }
      
      // Verificar conflicto de grupo
      if (
        existing.groupId === newAssignment.groupId &&
        existing.scheduleDay === newAssignment.scheduleDay
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
        existing.scheduleDay === newAssignment.scheduleDay
      ) {
        if (newAssignment.startTime < existing.endTime && newAssignment.endTime > existing.startTime) {
          return `Conflicto de Aula: El ${newAssignment.classroom} ya está ocupado de ${existing.startTime} a ${existing.endTime} el ${DAYS_OF_WEEK[existing.scheduleDay]}.`;
        }
      }
    }
    return null;
  };

  
  const handleAutoAssign = () => {
    let currentList = [...assignments];
    let newAssignedCount = 0;
    
    // Obtener materias pendientes
    const pending = availableTemplateSlots.flatMap(opt => opt[1]);
    
    for (const slot of pending) {
      const availabilitiesOnly = currentList.filter(a => a.isAvailable === true);
      let assigned = false;
      
      for (const av of availabilitiesOnly) {
        const testA = {
          teacherId: av.teacherId,
          subjectId: slot.subjectId,
          groupId: slot.tpl.groupId,
          scheduleDay: av.scheduleDay,
          startTime: av.startTime,
          endTime: av.endTime,
          classroom: slot.tpl.classroom,
          modulo: slot.tpl.modulo
        };
        
        if (!checkConflict(testA, currentList)) {
          currentList.push({
            ...testA,
            id: `mock-auto-${Date.now()}-${Math.random()}`
          });
          newAssignedCount++;
          assigned = true;
          break;
        }
      }
    }
    
    if (newAssignedCount > 0) {
      setAssignments(currentList);
      
      const affectedTeacherIds = [...new Set(currentList.filter(a => !a.isAvailable).map(a => a.teacherId))];
      Promise.all(
        affectedTeacherIds.map(tid => {
          const teacherAssignments = currentList.filter(a => a.teacherId === tid && !a.isAvailable);
          return fetch('/api/assignments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teacherId: tid, assignments: teacherAssignments })
          });
        })
      ).then(() => {
        alert(`✨ Magia completada: Se asignaron y GUARDARON ${newAssignedCount} materias a los horarios disponibles.`);
      }).catch(err => {
        console.error(err);
        alert('Se asignaron localmente pero hubo un error al guardar en la base de datos.');
      });
    } else {
      alert('No se encontraron horarios compatibles para asignar automáticamente.');
    }
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

    const conflict = checkConflict(newAssignment);
    if (conflict) {
      setFormError(conflict);
      return;
    }

    setAssignPreview(newAssignment);
  };

  const confirmAssignment = () => {
    if (!assignPreview) return;
    setAssignments([...assignments, assignPreview as any]);
    setIsFormOpen(false);
    setAssignPreview(null);
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
    const newAsg = assignments.filter(a => a.id !== id);
    setAssignments(newAsg);
    
    // Save to server if we have teacherId
    const asg = assignments.find(a => a.id === id);
    if (asg) {
      fetch(`/api/assignments/${asg.teacherId}`, {
        method: 'DELETE',
        body: JSON.stringify({ assignmentId: id })
      }).catch(console.error);
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

  const handlePrint = (mode: 'groups' | 'teachers', targetId: string | null = null) => {
    setPrintMode(mode);
    setPrintTargetId(targetId);
    setTimeout(() => {
      window.print();
      setPrintTargetId(null);
    }, 300);
  };

  const handleDownloadPNG = (mode: 'groups' | 'teachers', targetId: string | null = null) => {
    setIsCapturing(true);
    setPrintMode(mode);
    setPrintTargetId(targetId);
    // Le damos tiempo a que React actualice el DOM quitando la clase hidden
    setTimeout(async () => {
      try {
        const html2canvas = (await import('html2canvas')).default;
        const containerId = mode === 'groups' ? 'print-container' : 'print-container-teachers';
        const element = document.getElementById(containerId);
        if (element) {
          const canvas = await html2canvas(element, { scale: 2 });
          const dataURL = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = dataURL;
          link.download = `Horario_${mode === 'groups' ? 'Alumnos' : 'Docente'}_${targetId ? targetId.substring(0,6) : 'Todos'}.png`;
          link.click();
        }
      } catch (error) {
        console.error("Error al generar el PNG", error);
      } finally {
        setIsCapturing(false);
        setPrintTargetId(null);
      }
    }, 300);
  };

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

        {/* Filtros y controles */}
        <div id="filtros-horarios" className="bg-white rounded-lg shadow-md p-4 mb-6">
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
            <div className="flex items-center gap-2 border-l border-gray-300 pl-4 ml-2">
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
              {filterTeacher && (
                <div className="flex gap-1 bg-gray-50 border border-gray-200 rounded p-1">
                  <Button size="sm" variant="outline" onClick={() => handlePrint('teachers', filterTeacher)} className="h-8 px-2 text-xs font-bold text-blue-700 border-blue-200" title="PDF Docente">PDF</Button>
                  <Button size="sm" variant="outline" onClick={() => handleDownloadPNG('teachers', filterTeacher)} disabled={isCapturing} className="h-8 px-2 text-xs font-bold text-emerald-700 border-emerald-200" title="PNG Docente">{isCapturing && printMode === 'teachers' && printTargetId === filterTeacher ? '...' : 'PNG'}</Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 border-l border-gray-300 pl-4 ml-2">
              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los grupos (Alumnos)</option>
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
              {filterGroup && (
                <div className="flex gap-1 bg-gray-50 border border-gray-200 rounded p-1">
                  <Button size="sm" variant="outline" onClick={() => handlePrint('groups', filterGroup)} className="h-8 px-2 text-xs font-bold text-blue-700 border-blue-200" title="PDF Grupo">PDF</Button>
                  <Button size="sm" variant="outline" onClick={() => handleDownloadPNG('groups', filterGroup)} disabled={isCapturing} className="h-8 px-2 text-xs font-bold text-emerald-700 border-emerald-200" title="PNG Grupo">{isCapturing && printMode === 'groups' && printTargetId === filterGroup ? '...' : 'PNG'}</Button>
                </div>
              )}
            </div>

            {(filterTeacher || filterGroup) && (
              <button
                onClick={() => { setFilterTeacher(''); setFilterGroup(''); }}
                className="text-sm text-red-600 hover:text-red-800 font-medium ml-2"
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
          <div className="bg-transparent space-y-8">
            {(() => {
              const allTeacherIds = new Set([
                ...filteredAssignments.map(a => a.teacherId),
                ...teacherAvailability.map(av => av.teacherId)
              ]);
              const teachersInView = Array.from(allTeacherIds).filter(tid => {
                if (filterTeacher && tid !== filterTeacher) return false;
                if (filterGroup) {
                  return filteredAssignments.some(a => a.teacherId === tid && a.groupId === filterGroup);
                }
                return true;
              });
              if (teachersInView.length === 0) {
                return (
                  <div className="bg-white rounded-xl shadow-md p-16 text-center border border-gray-100">
                    <div className="text-6xl mb-4">🗓️</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No hay horarios disponibles</h3>
                    <p className="text-sm text-gray-500">
                      {filterTeacher ? 'Este docente no ha enviado su disponibilidad o no tienes grupos seleccionados.' : 'No hay docentes con disponibilidad o clases que coincidan con los filtros.'}
                    </p>
                  </div>
                );
              }

              return teachersInView.map(tid => {
                const teacher = getTeacherById(tid);
                const tAssignments = filteredAssignments
                  .filter(a => a.teacherId === tid)
                  .sort((a, b) => a.scheduleDay - b.scheduleDay || a.startTime.localeCompare(b.startTime));

                return (
                  <div key={tid} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                    {/* Header del Maestro */}
                    <div className="bg-gradient-to-r from-[#061266] to-[#1877f2] text-white px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
                          {teacher?.firstName?.charAt(0)}{teacher?.lastName?.charAt(0)}
                        </div>
                        <h3 className="font-bold text-lg tracking-wide uppercase">{teacher?.firstName} {teacher?.lastName}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {tAssignments.length > 0 && (
                          <div className="flex gap-1 bg-white/10 rounded p-1 mr-2">
                            <Button size="sm" variant="outline" onClick={() => handlePrint('teachers', teacher?.id)} className="h-6 px-2 text-[10px] font-bold text-white border-white/30 hover:bg-white/20 hover:text-white" title="Imprimir PDF">PDF</Button>
                            <Button size="sm" variant="outline" onClick={() => handleDownloadPNG('teachers', teacher?.id)} disabled={isCapturing} className="h-6 px-2 text-[10px] font-bold text-white border-white/30 hover:bg-white/20 hover:text-white" title="Descargar PNG">{isCapturing && printMode === 'teachers' && printTargetId === teacher?.id ? '...' : 'PNG'}</Button>
                          </div>
                        )}
                        <span className="text-xs font-semibold bg-white text-blue-900 px-3 py-1 rounded-full shadow-sm">
                          {tAssignments.length} Registros
                        </span>
                      </div>
                    </div>
                    
                    {/* Tabla de Horarios */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left font-semibold text-gray-700 w-[15%]">Día</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-700 w-[20%]">Disponibilidad</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-700 w-[65%]">Asignación de Clase</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const tAvailabilities = teacherAvailability.filter(av => av.teacherId === teacher.id);
                            const orphanedAssignments = tAssignments.filter(a => !tAvailabilities.some(av => a.scheduleDay === av.dayOfWeek && a.startTime >= av.startTime && a.endTime <= av.endTime));

                            return (
                              <>
                                {tAvailabilities.map(av => {
                                  const blockAssignments = tAssignments.filter(a => 
                                    a.scheduleDay === av.dayOfWeek &&
                                    a.startTime >= av.startTime &&
                                    a.endTime <= av.endTime
                                  );

                                  return (
                                    <React.Fragment key={av.id}>
                                      <tr className="border-b border-emerald-100 bg-emerald-50/30">
                                        <td className="px-6 py-4 font-black uppercase text-emerald-900">
                                          {DAYS_OF_WEEK[av.dayOfWeek]}
                                        </td>
                                        <td className="px-6 py-4 font-mono font-semibold text-emerald-900">
                                          {av.startTime} — {av.endTime} <span className="block text-xs text-emerald-600">Bloque Disponible</span>
                                        </td>
                                        <td className="px-6 py-3">
                                          <select
                                            className="w-full px-3 py-2 border rounded-lg text-sm font-medium focus:ring-2 outline-none transition-shadow bg-white border-emerald-300 text-emerald-800 focus:ring-emerald-500"
                                            value=""
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              if (val !== "") {
                                                const [tplId, subjId] = val.split('_');
                                                const sourceTemplates = dbTemplates.length > 0 ? dbTemplates : MOCK_GROUP_TEMPLATES;
                                                const tpl = sourceTemplates.find(t => t.id === tplId);
                                                
                                                if (tpl) {
                                                  if (!tpl.startTime || !tpl.endTime) {
                                                    alert("La plantilla seleccionada no tiene un horario de inicio/fin definido. Por favor, edítela en Grupos Académicos para asignarle un horario.");
                                                    e.target.value = "";
                                                    return;
                                                  }

                                                  const newAssignment = {
                                                    id: `mock-a-${Date.now()}-${Math.random()}`,
                                                    teacherId: teacher.id,
                                                    subjectId: subjId,
                                                    groupId: tpl.groupId,
                                                    scheduleDay: av.dayOfWeek,
                                                    startTime: tpl.startTime,
                                                    endTime: tpl.endTime,
                                                    classroom: tpl.classroom,
                                                    modulo: tpl.modulo,
                                                    academicYear: '2023-2024',
                                                    isAvailable: false
                                                  };
                                                  
                                                  const conflict = checkConflict(newAssignment, assignments);
                                                  if (conflict) {
                                                    alert(conflict);
                                                    e.target.value = "";
                                                    return;
                                                  }

                                                  const newAsg = [...assignments, newAssignment];
                                                  setAssignments(newAsg);
                                                  
                                                  fetch('/api/assignments', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ teacherId: teacher.id, assignments: newAsg.filter(a => a.teacherId === teacher.id) })
                                                  }).catch(console.error);
                                                }
                                              }
                                            }}
                                          >
                                            <option value="">➕ Asignar nueva clase en este bloque...</option>
                                            {availableTemplateSlots.map(([groupName, options]) => (
                                              <optgroup key={groupName} label={groupName}>
                                                {options.map((opt: any) => (
                                                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                                                ))}
                                              </optgroup>
                                            ))}
                                          </select>
                                        </td>
                                      </tr>
                                      
                                      {blockAssignments.map(a => {
                                        const isAssigned = a.subjectId && a.subjectId !== 'mock-s1';
                                        const assignedSubject = isAssigned ? getSubjectById(a.subjectId) : null;
                                        const assignedGroup = isAssigned ? getGroupById(a.groupId) : null;
                                        
                                        return (
                                          <tr key={a.id} className="border-b border-gray-100 bg-blue-50/50 hover:bg-blue-100/70 border-l-4 border-l-blue-500">
                                            <td className="px-6 py-3 font-black uppercase text-blue-900 text-right">
                                              <span className="text-xs text-gray-500 block mr-4">Asignado:</span>
                                            </td>
                                            <td className="px-6 py-3 font-mono font-semibold text-blue-900 text-sm">
                                              ↳ {a.startTime} — {a.endTime}
                                            </td>
                                            <td className="px-6 py-2">
                                              <div className="flex items-center gap-2">
                                                <div className="flex-1 px-3 py-2 border rounded-lg text-sm font-medium bg-white border-blue-300 text-blue-900 shadow-sm truncate flex justify-between items-center">
                                                  <span>🎓 Mód {a.modulo} | {assignedGroup?.name} - {assignedSubject?.name} ({a.classroom})</span>
                                                  {a.createdBy && (
                                                    <span className="text-xs text-blue-600 font-normal italic print:hidden pl-2 border-l border-blue-200">
                                                      Asignado por: {a.createdBy.firstName || a.createdBy.email.split('@')[0]}
                                                    </span>
                                                  )}
                                                </div>
                                                <button 
                                                  onClick={() => {
                                                    const newAsg = assignments.filter(x => x.id !== a.id);
                                                    setAssignments(newAsg);
                                                    fetch('/api/assignments', {
                                                      method: 'POST',
                                                      headers: { 'Content-Type': 'application/json' },
                                                      body: JSON.stringify({ teacherId: teacher.id, assignments: newAsg.filter(x => x.teacherId === teacher.id) })
                                                    }).catch(console.error);
                                                  }}
                                                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg font-bold border border-transparent hover:border-red-200 transition-colors"
                                                  title="Eliminar Asignación"
                                                >
                                                  ✕
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </React.Fragment>
                                  );
                                })}

                                {orphanedAssignments.map(a => {
                                  const isAssigned = a.subjectId && a.subjectId !== 'mock-s1';
                                  const assignedSubject = isAssigned ? getSubjectById(a.subjectId) : null;
                                  const assignedGroup = isAssigned ? getGroupById(a.groupId) : null;
                                  
                                  return (
                                    <tr key={a.id} className="border-b border-red-100 bg-red-50/50 hover:bg-red-100/70 border-l-4 border-l-red-500">
                                      <td className="px-6 py-3 font-black uppercase text-red-900">
                                        {DAYS_OF_WEEK[a.scheduleDay]}
                                        <span className="text-[10px] text-red-500 block leading-tight">Fuera de disp.</span>
                                      </td>
                                      <td className="px-6 py-3 font-mono font-semibold text-red-900 text-sm">
                                        {a.startTime} — {a.endTime}
                                      </td>
                                      <td className="px-6 py-2">
                                        <div className="flex items-center gap-2">
                                          <div className="flex-1 px-3 py-2 border rounded-lg text-sm font-medium bg-white border-red-300 text-red-900 shadow-sm truncate flex justify-between items-center">
                                            <span>🎓 Mód {a.modulo} | {assignedGroup?.name} - {assignedSubject?.name} ({a.classroom})</span>
                                            {a.createdBy && (
                                              <span className="text-xs text-red-600 font-normal italic print:hidden pl-2 border-l border-red-200">
                                                Asignado por: {a.createdBy.firstName || a.createdBy.email.split('@')[0]}
                                              </span>
                                            )}
                                          </div>
                                          <button 
                                            onClick={() => {
                                              const newAsg = assignments.filter(x => x.id !== a.id);
                                              setAssignments(newAsg);
                                              fetch('/api/assignments', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ teacherId: teacher.id, assignments: newAsg.filter(x => x.teacherId === teacher.id) })
                                              }).catch(console.error);
                                            }}
                                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg font-bold border border-transparent hover:border-red-200 transition-colors"
                                            title="Eliminar Asignación"
                                          >
                                            ✕
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </>
                            );
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              });
            })()}
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

      {/* Modal de Vista Previa de Asignación */}
      {assignPreview && (
        <Modal 
          isOpen={!!assignPreview} 
          onClose={() => setAssignPreview(null)} 
          title="✨ Vista Previa de Asignación"
        >
          <div className="p-6">
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 mb-6 rounded-r-lg">
              <h3 className="text-emerald-800 font-bold mb-1">¡Todo en orden!</h3>
              <p className="text-sm text-emerald-700">
                El sistema verificó que no hay choques de horario ni conflictos de aula.
              </p>
            </div>

            <div className="space-y-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 text-sm">Maestro:</span>
                <span className="font-bold">{getTeacherById(assignPreview.teacherId)?.firstName} {getTeacherById(assignPreview.teacherId)?.lastName}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 text-sm">Materia:</span>
                <span className="font-bold">{getSubjectById(assignPreview.subjectId)?.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 text-sm">Grupo:</span>
                <span className="font-bold">{getGroupById(assignPreview.groupId)?.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 text-sm">Horario:</span>
                <span className="font-bold text-blue-600 uppercase">
                  {DAYS_OF_WEEK[assignPreview.scheduleDay]} de {assignPreview.startTime} a {assignPreview.endTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Aula:</span>
                <span className="font-bold">{assignPreview.classroom || 'No especificada'}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setAssignPreview(null)}>
                Modificar
              </Button>
              <Button onClick={confirmAssignment} className="bg-[#1877f2] hover:bg-blue-600 text-white">
                Confirmar y Asignar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
    
    {printMode === 'groups' && (
      <PrintGroups 
        assignments={assignments.filter(a => printTargetId ? a.groupId === printTargetId : (filterGroup ? a.groupId === filterGroup : true))} 
        teachers={teachers}
        subjects={subjects.length > 0 ? subjects : MOCK_SUBJECTS}
        isCapturing={isCapturing && printMode === 'groups'} 
      />
    )}
    {printMode === 'teachers' && (
      <PrintTeachers 
        assignments={assignments.filter(a => printTargetId ? a.teacherId === printTargetId : (filterTeacher ? a.teacherId === filterTeacher : true))} 
        teachers={teachers}
        subjects={subjects.length > 0 ? subjects : MOCK_SUBJECTS}
        isCapturing={isCapturing && printMode === 'teachers'} 
      />
    )}
    </>
  );
}

export default function HorariosPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gray-500">Cargando gestión de horarios...</div>}>
      <HorariosContent />
    </Suspense>
  );
}
