'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Calendar as CalendarIcon, 
  User, 
  BookOpen, 
  Sparkles, 
  X, 
  ChevronDown, 
  Layers, 
  Link as LinkIcon,
  Check,
  Building2,
  GraduationCap
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DAYS_OF_WEEK } from '@/lib/mockData';

interface AssignmentMatrixTableProps {
  templates: any[];
  groups: any[];
  subjects: any[];
  teachers: any[];
  assignments: any[];
  teacherAvailability: any[];
  academicYear?: string;
  onAssign: (data: {
    id?: string;
    teacherId: string;
    subjectId: string;
    groupId: string;
    scheduleDay: number;
    startTime: string;
    endTime: string;
    classroom: string;
    modulo: number;
    cuatrimestre: number;
    academicYear: string;
  }) => Promise<boolean>;
  onUnassign: (assignment: any) => Promise<boolean>;
}

export function AssignmentMatrixTable({
  templates,
  groups,
  subjects,
  teachers,
  assignments,
  teacherAvailability,
  academicYear = '2026-2027',
  onAssign,
  onUnassign,
}: AssignmentMatrixTableProps) {
  // Filtros rápidos
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCareer, setSelectedCareer] = useState<string>('all');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'assigned'>('all');
  
  // Feedback visual de guardado en vivo
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [lastSavedKey, setLastSavedKey] = useState<string | null>(null);

  // Selector flotante abierto
  const [openSelectorKey, setOpenSelectorKey] = useState<string | null>(null);

  // Lista de carreras únicas
  const careersList = useMemo(() => {
    const set = new Set<string>();
    groups.forEach(g => {
      if (g.career?.name) set.add(g.career.name);
      else if (g.carrera) set.add(g.carrera);
    });
    return Array.from(set).sort();
  }, [groups]);

  // Aplanar todas las materias que deben impartirse según las plantillas
  const matrixItems = useMemo(() => {
    const list: any[] = [];

    templates.forEach(tpl => {
      const group = groups.find(g => g.id === tpl.groupId);
      if (!group) return;

      const careerName = group.career?.name || group.carrera || 'Sin Carrera';
      const subjectIds = tpl.subjectIds || [];

      subjectIds.forEach((sId: string) => {
        const subject = subjects.find(s => s.id === sId);
        
        // Buscar si ya existe una asignación real
        const existing = assignments.find(a => 
          a.groupId === tpl.groupId &&
          a.modulo === tpl.modulo &&
          a.subjectId === sId &&
          a.teacherId !== null
        );

        const assignedTeacher = existing?.teacherId ? teachers.find(t => t.id === existing.teacherId) : null;
        
        // Días por defecto según el turno si no está asignado
        let defaultDay = 0; // Lunes
        if (tpl.turno === 'Sabatino') defaultDay = 5;
        else if (tpl.turno === 'Dominical') defaultDay = 6;
        else if (tpl.turno === 'Matutino' || tpl.turno === 'Vespertino') defaultDay = 1; // Martes por convención inicial

        const scheduleDay = existing?.scheduleDay !== undefined && existing.scheduleDay !== null && existing.scheduleDay >= 0 
          ? existing.scheduleDay 
          : defaultDay;

        const startTime = existing?.startTime || tpl.startTime || '08:00';
        const endTime = existing?.endTime || tpl.endTime || '09:30';
        const classroom = existing?.classroom || tpl.classroom || 'Sin Aula';

        const rowKey = `${tpl.groupId}_${tpl.modulo}_${sId}`;

        list.push({
          rowKey,
          templateId: tpl.id,
          groupId: tpl.groupId,
          groupName: group.name,
          careerName,
          cuatrimestre: group.cuatrimestre || 1,
          academicYear: group.academicYear || academicYear,
          modulo: tpl.modulo,
          turno: tpl.turno || 'Matutino',
          classroom,
          subjectId: sId,
          subjectName: subject?.name || 'Materia Desconocida',
          subjectCode: subject?.code || '',
          existingAssignment: existing || null,
          assignedTeacher,
          scheduleDay,
          startTime,
          endTime,
          isFusion: Boolean(existing?.fusionGroupId),
          fusionGroupId: existing?.fusionGroupId || null,
          createdBy: existing?.createdBy || null,
        });
      });
    });

    return list;
  }, [templates, groups, subjects, assignments, teachers, academicYear]);

  // Filtrado de la matriz
  const filteredItems = useMemo(() => {
    return matrixItems.filter(item => {
      // Búsqueda libre
      if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        const match = 
          item.subjectName.toLowerCase().includes(lower) ||
          item.groupName.toLowerCase().includes(lower) ||
          item.careerName.toLowerCase().includes(lower) ||
          (item.assignedTeacher && `${item.assignedTeacher.firstName} ${item.assignedTeacher.lastName}`.toLowerCase().includes(lower)) ||
          item.classroom.toLowerCase().includes(lower);
        if (!match) return false;
      }

      // Filtro por Carrera
      if (selectedCareer !== 'all' && item.careerName !== selectedCareer) {
        return false;
      }

      // Filtro por Módulo
      if (selectedModule !== 'all' && String(item.modulo) !== selectedModule) {
        return false;
      }

      // Filtro por Estado
      if (statusFilter === 'pending' && item.assignedTeacher) return false;
      if (statusFilter === 'assigned' && !item.assignedTeacher) return false;

      return true;
    });
  }, [matrixItems, searchTerm, selectedCareer, selectedModule, statusFilter]);

  // Agrupar filas filtradas por Grupo y Módulo (como hojas/secciones ordenadas)
  const groupedRows = useMemo(() => {
    const map = new Map<string, { groupHeader: string; careerName: string; modulo: number; turno: string; items: any[] }>();

    filteredItems.forEach(item => {
      const groupKey = `${item.careerName} — Grupo ${item.groupName} (Módulo ${item.modulo})`;
      if (!map.has(groupKey)) {
        map.set(groupKey, {
          groupHeader: `Grupo ${item.groupName} · Cuatrimestre ${item.cuatrimestre}`,
          careerName: item.careerName,
          modulo: item.modulo,
          turno: item.turno,
          items: []
        });
      }
      map.get(groupKey)!.items.push(item);
    });

    return Array.from(map.entries());
  }, [filteredItems]);

  // Estadísticas rápidas
  const totalSlots = matrixItems.length;
  const assignedSlots = matrixItems.filter(i => i.assignedTeacher !== null).length;
  const pendingSlots = totalSlots - assignedSlots;
  const progressPercent = totalSlots > 0 ? Math.round((assignedSlots / totalSlots) * 100) : 0;

  // Analizar compatibilidad de maestros para una materia/fila
  const getTeacherRecommendations = (item: any) => {
    const activeTeachers = teachers.filter(t => t.contractStatus !== 'inactive');

    return activeTeachers.map(teacher => {
      // 1. Disponibilidad declarada
      const hasAvailability = teacherAvailability.some(av => 
        av.teacherId === teacher.id &&
        av.dayOfWeek === item.scheduleDay &&
        av.isAvailable &&
        (!item.startTime || !av.startTime || av.startTime <= item.startTime) &&
        (!item.endTime || !av.endTime || av.endTime >= item.endTime)
      );

      // 2. Conflicto de horario con otra clase asignada
      const conflictingClass = assignments.find(a => 
        a.teacherId === teacher.id &&
        a.scheduleDay === item.scheduleDay &&
        a.id !== item.existingAssignment?.id &&
        a.startTime && item.startTime &&
        !(item.endTime <= a.startTime || item.startTime >= a.endTime)
      );

      // 3. Especialidad
      const specialization = teacher.specialization || '';
      const matchesSpecialization = specialization && item.subjectName.toLowerCase().includes(specialization.toLowerCase());

      let score = 0;
      if (hasAvailability) score += 50;
      if (!conflictingClass) score += 30;
      if (matchesSpecialization) score += 20;

      return {
        teacher,
        hasAvailability,
        conflictingClass,
        matchesSpecialization,
        score
      };
    }).sort((a, b) => b.score - a.score);
  };

  // Manejar asignación con 1 solo clic
  const handleSelectTeacher = async (item: any, teacherId: string) => {
    setOpenSelectorKey(null);
    setSavingKey(item.rowKey);

    const success = await onAssign({
      id: item.existingAssignment?.id,
      teacherId,
      subjectId: item.subjectId,
      groupId: item.groupId,
      scheduleDay: item.scheduleDay,
      startTime: item.startTime,
      endTime: item.endTime,
      classroom: item.classroom,
      modulo: item.modulo,
      cuatrimestre: item.cuatrimestre,
      academicYear: item.academicYear,
    });

    setSavingKey(null);
    if (success) {
      setLastSavedKey(item.rowKey);
      setTimeout(() => setLastSavedKey(null), 2500);
    }
  };

  // Manejar cambio de día u horas in-line
  const handleUpdateSchedule = async (item: any, field: 'scheduleDay' | 'startTime' | 'endTime', value: any) => {
    if (!item.existingAssignment) return; // Si no está asignado aún, se guardará cuando elija maestro

    setSavingKey(item.rowKey);
    await onAssign({
      ...item.existingAssignment,
      [field]: value
    });
    setSavingKey(null);
  };

  // Manejar desasignación con 1 clic
  const handleRemoveAssignment = async (item: any) => {
    if (!item.existingAssignment) return;
    setSavingKey(item.rowKey);
    await onUnassign(item.existingAssignment);
    setSavingKey(null);
  };

  return (
    <div className="space-y-6">
      {/* ================= BARRA DE PROGRESO Y CONTROL ================= */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#061266]">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Matriz de Asignación Rápida</h2>
                <p className="text-sm text-gray-500">Asigna materias de plantillas directamente a maestros con un solo clic.</p>
              </div>
            </div>
          </div>

          {/* Estadísticas Visuales tipo Semáforo */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 text-center">
              <span className="text-xs text-gray-400 font-semibold block">TOTAL CLASES</span>
              <span className="text-xl font-bold text-gray-800">{totalSlots}</span>
            </div>
            <div className="px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
              <span className="text-xs text-emerald-600 font-semibold block">CUBIERTAS</span>
              <span className="text-xl font-bold text-emerald-700">{assignedSlots}</span>
            </div>
            <div className="px-4 py-2 bg-rose-50 rounded-xl border border-rose-100 text-center">
              <span className="text-xs text-rose-500 font-semibold block">PENDIENTES</span>
              <span className="text-xl font-bold text-rose-600">{pendingSlots}</span>
            </div>

            {/* Barra de Progreso Circular / Lineal */}
            <div className="w-36 flex flex-col justify-center">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-gray-600">Avance</span>
                <span className="text-emerald-700">{progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================= FILTROS RÁPIDOS TIPO HOJA DE CÁLCULO ================= */}
        <div className="pt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar por materia, grupo, maestro o aula..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filtro por Carrera */}
            <select
              value={selectedCareer}
              onChange={e => setSelectedCareer(e.target.value)}
              className="py-2 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">🎓 Todas las carreras</option>
              {careersList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Filtro por Módulo */}
            <select
              value={selectedModule}
              onChange={e => setSelectedModule(e.target.value)}
              className="py-2 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">⏱️ Todos los Módulos</option>
              <option value="1">Módulo 1</option>
              <option value="2">Módulo 2</option>
            </select>
          </div>

          {/* Botones de Estado */}
          <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'all' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Todas ({totalSlots})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                statusFilter === 'pending' 
                  ? 'bg-rose-50 text-rose-700 shadow-sm border border-rose-200' 
                  : 'text-gray-500 hover:text-rose-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Solo Pendientes ({pendingSlots})
            </button>
            <button
              onClick={() => setStatusFilter('assigned')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                statusFilter === 'assigned' 
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-200' 
                  : 'text-gray-500 hover:text-emerald-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Cubiertas ({assignedSlots})
            </button>
          </div>
        </div>
      </div>

      {/* ================= TABLA TIPO EXCEL INTELIGENTE ================= */}
      {groupedRows.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
          <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-bold text-gray-700">No se encontraron materias</h3>
          <p className="text-sm text-gray-400 mt-1">Prueba ajustando los filtros de búsqueda o módulo arriba.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedRows.map(([groupKey, groupData]) => (
            <div key={groupKey} className="bg-white rounded-2xl shadow-sm border border-gray-200/90 overflow-hidden">
              {/* Cabecera del Grupo (como hoja de Excel) */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50/40 px-6 py-3.5 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#061266] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {groupData.modulo === 1 ? 'M1' : 'M2'}
                  </div>
                  <div>
                    <span className="font-black text-gray-900 tracking-tight text-base">
                      {groupData.careerName}
                    </span>
                    <span className="text-gray-400 mx-2">·</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {groupData.groupHeader}
                    </span>
                    <span className="text-xs font-medium text-gray-500 ml-2">
                      (Turno: {groupData.turno})
                    </span>
                  </div>
                </div>

                <span className="text-xs font-semibold text-gray-500">
                  {groupData.items.filter(i => i.assignedTeacher).length} de {groupData.items.length} cubiertas
                </span>
              </div>

              {/* Filas de Materias */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50/60 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                      <th className="py-2.5 px-6 w-[28%]">Materia</th>
                      <th className="py-2.5 px-4 w-[16%]">Día & Horario</th>
                      <th className="py-2.5 px-3 w-[12%]">Aula</th>
                      <th className="py-2.5 px-4 w-[34%]">Maestro Asignado</th>
                      <th className="py-2.5 px-4 w-[10%] text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {groupData.items.map(item => {
                      const isAssigned = item.assignedTeacher !== null;
                      const isSaving = savingKey === item.rowKey;
                      const isJustSaved = lastSavedKey === item.rowKey;
                      const isOpen = openSelectorKey === item.rowKey;
                      const recommendations = isOpen ? getTeacherRecommendations(item) : [];

                      return (
                        <tr 
                          key={item.rowKey} 
                          className={`group hover:bg-blue-50/30 transition-colors ${
                            isJustSaved ? 'bg-emerald-50/50' : isAssigned ? 'bg-white' : 'bg-rose-50/20'
                          }`}
                        >
                          {/* 1. Materia */}
                          <td className="py-3 px-6">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 leading-snug">
                                {item.subjectName}
                              </span>
                              {item.isFusion && (
                                <span 
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80" 
                                  title="Materia fusionada con otro grupo"
                                >
                                  <LinkIcon className="w-3 h-3" /> Fusionada
                                </span>
                              )}
                            </div>
                            {item.subjectCode && (
                              <span className="text-[11px] font-mono text-gray-400 block mt-0.5">
                                Clave: {item.subjectCode}
                              </span>
                            )}
                          </td>

                          {/* 2. Día & Horario (In-line editable) */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              {isAssigned ? (
                                <div className="flex flex-col">
                                  <span className="font-bold text-gray-800 text-xs uppercase">
                                    {DAYS_OF_WEEK[item.scheduleDay] || 'Sin día'}
                                  </span>
                                  <span className="font-mono text-xs text-gray-500">
                                    {item.startTime} - {item.endTime}
                                  </span>
                                </div>
                              ) : (
                                <div className="text-xs text-gray-400 italic">
                                  {DAYS_OF_WEEK[item.scheduleDay]} ({item.startTime}-{item.endTime})
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 3. Aula */}
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1 font-mono text-xs px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg font-semibold">
                              <Building2 className="w-3 h-3 text-gray-400" />
                              {item.classroom}
                            </span>
                          </td>

                          {/* 4. Maestro Asignado (Celda Interactiva 1-Clic) */}
                          <td className="py-3 px-4 relative">
                            {isSaving ? (
                              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                                Guardando en vivo...
                              </div>
                            ) : isAssigned ? (
                              /* Chip del Maestro Asignado */
                              <div className="flex items-center justify-between gap-2 max-w-sm bg-blue-50/80 border border-blue-200/80 rounded-xl px-3 py-1.5 shadow-sm">
                                <div className="flex items-center gap-2.5 overflow-hidden">
                                  <div className="w-7 h-7 rounded-full bg-[#061266] text-white flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-xs">
                                    {item.assignedTeacher.firstName?.[0] || 'D'}
                                  </div>
                                  <div className="truncate">
                                    <span className="font-bold text-gray-900 text-xs block truncate">
                                      {item.assignedTeacher.firstName} {item.assignedTeacher.lastName}
                                    </span>
                                    <span className="text-[10px] text-gray-500 block truncate">
                                      {item.assignedTeacher.specialization || 'Docente'}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {/* Botón para cambiar de maestro */}
                                  <button
                                    onClick={() => setOpenSelectorKey(isOpen ? null : item.rowKey)}
                                    className="p-1 hover:bg-blue-200/60 rounded-lg text-blue-700 text-xs transition-colors"
                                    title="Cambiar maestro"
                                  >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </button>
                                  {/* Botón para desasignar */}
                                  <button
                                    onClick={() => handleRemoveAssignment(item)}
                                    className="p-1 hover:bg-rose-100 rounded-lg text-rose-500 hover:text-rose-700 text-xs transition-colors"
                                    title="Desasignar clase"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* Botón para asignar con 1 clic */
                              <div>
                                <button
                                  onClick={() => setOpenSelectorKey(isOpen ? null : item.rowKey)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-xs ${
                                    isOpen 
                                      ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-200' 
                                      : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50 hover:border-blue-400'
                                  }`}
                                >
                                  <User className="w-3.5 h-3.5" />
                                  <span>+ Asignar Maestro</span>
                                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                </button>
                              </div>
                            )}

                            {/* DROPDOWN FLOTANTE INTELIGENTE */}
                            {isOpen && (
                              <div className="absolute left-4 top-14 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                <div className="p-2 border-b border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500">
                                  <span>Selecciona un maestro para este horario:</span>
                                  <button onClick={() => setOpenSelectorKey(null)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="max-h-64 overflow-y-auto divide-y divide-gray-50 py-1">
                                  {recommendations.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-gray-400">
                                      No hay maestros registrados.
                                    </div>
                                  ) : (
                                    recommendations.map(({ teacher, hasAvailability, conflictingClass, matchesSpecialization }) => {
                                      const isCurrent = item.assignedTeacher?.id === teacher.id;

                                      return (
                                        <button
                                          key={teacher.id}
                                          onClick={() => handleSelectTeacher(item, teacher.id)}
                                          className={`w-full text-left p-2.5 rounded-xl hover:bg-blue-50/80 transition-colors flex items-center justify-between group ${
                                            isCurrent ? 'bg-blue-50 font-bold' : ''
                                          }`}
                                        >
                                          <div className="flex items-center gap-2.5 overflow-hidden">
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                              hasAvailability && !conflictingClass
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : 'bg-gray-100 text-gray-600'
                                            }`}>
                                              {teacher.firstName?.[0] || 'D'}
                                            </div>
                                            <div className="truncate">
                                              <div className="flex items-center gap-1.5">
                                                <span className="text-xs text-gray-900 font-semibold truncate">
                                                  {teacher.firstName} {teacher.lastName}
                                                </span>
                                                {matchesSpecialization && (
                                                  <span title="Especialidad coincide" className="text-amber-500 text-[10px]">⭐</span>
                                                )}
                                              </div>
                                              <span className="text-[10px] text-gray-500 block truncate">
                                                {hasAvailability && !conflictingClass ? (
                                                  <span className="text-emerald-600 font-medium">✓ Disponible en este horario</span>
                                                ) : conflictingClass ? (
                                                  <span className="text-rose-500 font-medium">⚠ Conflicto ({conflictingClass.startTime})</span>
                                                ) : (
                                                  <span>Sin disp. declarada</span>
                                                )}
                                              </span>
                                            </div>
                                          </div>

                                          {isCurrent && (
                                            <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                          )}
                                        </button>
                                      );
                                    })
                                  )}
                                </div>
                              </div>
                            )}
                          </td>

                          {/* 5. Estado */}
                          <td className="py-3 px-4 text-right">
                            {isAssigned ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Cubierta
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200/80">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> Pendiente
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
