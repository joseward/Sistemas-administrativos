'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Button, Badge, Modal, Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { MOCK_ASSIGNMENTS } from '@/lib/mockData';
import { Select } from '@/components/ui/Select';
import { CatalogManagerModal } from '@/components/grupos/CatalogManagerModal';
import { AssignmentEditModal } from '@/components/grupos/AssignmentEditModal';
import { TemplateCreatorModal } from '@/components/grupos/TemplateCreatorModal';
import { MockGroupTemplate } from '@/lib/mockData';
import { useCurriculum } from '@/context/CurriculumContext';

export default function GruposPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    academicYear: 'Todos los años',
    modulo: '1',
    cuatrimestre: '',
    nivelAcademico: '',
    careerId: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);
  const [assignmentSubjectName, setAssignmentSubjectName] = useState('');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  
  // Promote Preview State
  const [promotePreview, setPromotePreview] = useState<{group: any, template: MockGroupTemplate, nextCuatri: number, nextModulo: number, nextSubjects: any[], isNextCuatri: boolean} | null>(null);
  const [templateToEdit, setTemplateToEdit] = useState<MockGroupTemplate | null>(null);

  const [assignments, setAssignments] = useState<any[]>(MOCK_ASSIGNMENTS);
  const { academicLevels = [], careers = [], subjects = [], groups = [], templates = [], academicYears = [], bimestres = [], cuatrimestres = [], refreshData = () => {} } = useCurriculum() || {};

  useEffect(() => {
    fetch('/api/assignments')
      .then(r => r.json())
      .then(data => {
        setAssignments(data.data || data.assignments || (Array.isArray(data) ? data : []));
      })
      .catch(console.error);

    fetch('/api/teachers')
      .then(res => res.json())
      .then(data => {
        setTeachers(data.data || data.teachers || (Array.isArray(data) ? data : []));
      })
      .catch(err => console.error("Error fetching teachers", err));
  }, []);

  useEffect(() => {
    const handleStartTour = (e: any) => {
      if (e.detail.tourId === 'grupos-tour') {
        const driverObj = driver({
          showProgress: true,
          nextBtnText: 'Siguiente →',
          prevBtnText: '← Anterior',
          doneBtnText: '¡Entendido!',
          steps: [
            { element: '#btn-nueva-plantilla', popover: { title: 'Nueva Plantilla', description: 'Usa este botón para crear la primera plantilla de un grupo desde cero. Es el primer paso para organizar el ciclo.', side: "left", align: 'start' }},
            { element: '#filtros-grupos', popover: { title: 'Filtros Inteligentes', description: 'Encuentra rápido tus grupos filtrando por carrera, cuatrimestre o módulo.', side: "bottom", align: 'start' }},
            { element: '#btn-promover-0', popover: { title: 'Promover Cuatrimestre', description: 'Cuando termine el módulo, presiona aquí para clonar las materias al siguiente nivel automáticamente.', side: "left", align: 'start' }}
          ]
        });
        driverObj.drive();
      }
    };
    window.addEventListener('start-tour', handleStartTour);
    return () => window.removeEventListener('start-tour', handleStartTour);
  }, []);

  // Construir las tablas a partir de las Plantillas
  const groupedAssignments = useMemo(() => {
    const grouped = new Map();
    
    templates.forEach((tpl) => {
      if (filters.modulo && tpl.modulo !== Number(filters.modulo)) return;
      
      const group = groups.find(g => g.id === tpl.groupId);
      if (!group) return;
      
      if (filters.cuatrimestre && group.cuatrimestre !== Number(filters.cuatrimestre)) return;
      if (filters.academicYear && filters.academicYear !== 'Todos los años' && group.academicYear !== filters.academicYear) return;
      
      // Filtrar por nivel académico si aplica
      if (filters.nivelAcademico) {
        const groupCareer = careers.find(c => c.id === group.careerId);
        if (!groupCareer || groupCareer.academicLevelId !== filters.nivelAcademico) return;
      }

      if (filters.careerId && group.careerId !== filters.careerId) return;

      const cuatriLabel = cuatrimestres.find((c: any) => c.value === group.cuatrimestre)?.label || `${group.cuatrimestre}er Cuatrimestre`;
      const carreraName = group.career?.name || 'Carrera';
      const groupKey = `${carreraName} - ${cuatriLabel} - Grupo ${group.name}`;
      
      if (!grouped.has(groupKey)) {
        grouped.set(groupKey, {
          label: groupKey,
          moduloLabel: `Módulo ${tpl.modulo}`,
          template: tpl,
          group: group,
          assignments: [],
        });
      }
      
      // Para cada materia en la plantilla, buscar si hay una asignación real
      tpl.subjectIds.forEach(subjectId => {
        // Buscar asignación
        const assignment = assignments.find(a => 
          a.groupId === tpl.groupId && 
          a.modulo === tpl.modulo && 
          a.subjectId === subjectId
        );

        if (assignment) {
          grouped.get(groupKey).assignments.push(assignment);
        } else {
          // Si no hay, creamos un registro "vacío" para mostrar en la tabla
          grouped.get(groupKey).assignments.push({
            id: `unassigned-${tpl.id}-${subjectId}`,
            subjectId,
            teacherId: null,
            groupId: tpl.groupId,
            modulo: tpl.modulo,
            classroom: tpl.classroom,
            scheduleDay: -1,
            startTime: '',
            endTime: ''
          });
        }
      });
    });
    
    // Convertir a array y ordenar
    const result = Array.from(grouped.values());
    result.forEach(g => {
      g.assignments.sort((a: any, b: any) => {
        // Poner los asignados primero, ordenados por día
        if (a.scheduleDay !== b.scheduleDay) return (a.scheduleDay || -1) - (b.scheduleDay || -1);
        return (a.startTime || '').localeCompare(b.startTime || '');
      });
    });
    
    return result;
  }, [templates, assignments, filters, groups, careers]);

  // Aplicar filtro de búsqueda general
  const filteredGroups = useMemo(() => {
    if (!searchTerm) return groupedAssignments;
    const search = searchTerm.toLowerCase();
    
    return groupedAssignments.map(g => {
      const groupMatch = g.group?.name?.toLowerCase().includes(search) || g.label?.toLowerCase().includes(search);
      
      if (groupMatch) {
        return g; // Mostrar toda la plantilla si coincide el grupo/carrera
      }

      const filteredAsgs = g.assignments.filter((a: any) => {
        const teacher = teachers.find(t => t.id === a.teacherId);
        const subject = subjects.find(s => s.id === a.subjectId);
        
        const teacherMatch = teacher ? (
          (teacher.firstName || '').toLowerCase().includes(search) ||
          (teacher.lastName || '').toLowerCase().includes(search)
        ) : false;
        
        const subjectMatch = subject ? subject.name.toLowerCase().includes(search) : false;

        return teacherMatch || subjectMatch;
      });
      
      return { ...g, assignments: filteredAsgs };
    }).filter(g => g.assignments.length > 0);
  }, [groupedAssignments, teachers, subjects, searchTerm]);

  const handlePromoteClick = (group: any, template: MockGroupTemplate) => {
    const currentCuatri = group.cuatrimestre;
    const currentModulo = template.modulo;
    
    // Todas las materias del cuatrimestre actual
    const currentCuatriSubjects = subjects.filter(s => 
      s.careerId === group.careerId && 
      s.cuatrimestre === currentCuatri
    );

    // Materias ya asignadas a este grupo en cualquier plantilla
    const assignedSubjectIds = new Set(
      templates.filter(t => t.groupId === group.id)
               .flatMap(t => t.subjectIds)
    );
    
    // Materias que faltan por impartir en este cuatrimestre
    const missingSubjectsCurrentCuatri = currentCuatriSubjects.filter(s => !assignedSubjectIds.has(s.id));

    let nextCuatri = currentCuatri;
    let nextModulo = currentModulo + 1;
    let nextSubjects = [];
    let isNextCuatri = false;

    if (missingSubjectsCurrentCuatri.length > 0) {
      // Hay materias restantes en el cuatrimestre actual, se promueve al siguiente módulo (bimestre)
      nextSubjects = missingSubjectsCurrentCuatri.slice(0, 3);
    } else {
      // Ya se dieron todas, se promueve al siguiente cuatrimestre
      nextCuatri = currentCuatri + 1;
      nextModulo = 1;
      isNextCuatri = true;
      nextSubjects = subjects.filter(s => 
        s.careerId === group.careerId && 
        s.cuatrimestre === nextCuatri
      ).slice(0, 3);
    }

    setPromotePreview({
      group, template, nextCuatri, nextModulo, nextSubjects, isNextCuatri
    });
  };

  const confirmPromote = () => {
    if (!promotePreview) return;
    const { group, template, nextCuatri, nextModulo, nextSubjects, isNextCuatri } = promotePreview;

    if (nextSubjects.length === 0) {
      alert(`No hay materias registradas en el catálogo para este ciclo.`);
      setPromotePreview(null);
      return;
    }

    let newGroupId = group.id;

    if (isNextCuatri) {
      // Crear o usar el grupo
      newGroupId = `mock-g-${Date.now()}`;
      const newGroup = {
        ...group,
        id: newGroupId,
        cuatrimestre: nextCuatri
      };
    }

    const newTemplate: MockGroupTemplate = {
      id: `tpl-${Date.now()}`,
      groupId: newGroupId,
      modulo: nextModulo,
      subjectIds: nextSubjects.map(s => s.id),
      classroom: template.classroom, // Conservar aula
      createdAt: new Date().toISOString()
    };

    fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupId: newTemplate.groupId,
        modulo: newTemplate.modulo,
        turno: newTemplate.turno,
        classroom: newTemplate.classroom,
        subjectIds: newTemplate.subjectIds,
      })
    }).then(res => res.json())
      .then(data => {
        setPromotePreview(null);
        refreshData();
      });
  };

  const handleEditTemplate = (template: MockGroupTemplate) => {
    setTemplateToEdit(template);
    setIsTemplateModalOpen(true);
  };

  const handleRemoveTemplate = (templateId: string) => {
    fetch(`/api/templates?id=${templateId}`, { method: 'DELETE' })
      .then(() => {
        refreshData();
      })
      .catch(err => console.error('Error al eliminar plantilla:', err));
  };

  const handleSaveAssignment = async (updatedAssignment: any) => {
    try {
      await fetch('/api/assignments/single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedAssignment)
      });
      refreshData();
    } catch (err) {
      console.error('Error saving assignment:', err);
      alert('Error al guardar la asignación');
    }
    setEditingAssignment(null);
  };

  const handleRemoveAssignment = async (assignmentId: string, templateId: string, subjectId: string) => {
    try {
      // Delete the assignment from the API if it exists
      if (assignmentId && !assignmentId.startsWith('pending-') && !assignmentId.startsWith('unassigned-')) {
        await fetch(`/api/assignments?id=${assignmentId}`, { method: 'DELETE' });
      }
      // Remove subject from template via API
      await fetch(`/api/templates/remove-subject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, subjectId })
      });
      refreshData();
    } catch (err) {
      console.error('Error al eliminar asignación:', err);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Botón Regresar */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-6 transition-colors group"
        >
          <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
          Regresar al inicio
        </Link>

        {/* Header */}
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-[#061266]">👥 Grupos Académicos</h1>
            <p className="text-gray-600 mt-2">
              Gestiona las plantillas de grupos y las materias asignadas.
            </p>
          </div>
          <div className="flex gap-4">
            <Button id="btn-nueva-plantilla" onClick={() => setIsTemplateModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2">
              <span className="text-lg">+</span> Nueva Plantilla
            </Button>
            <Button onClick={() => setIsCatalogModalOpen(true)} className="bg-[#061266] text-white">
              Catálogo de Materias
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div id="filtros-grupos" className="bg-white rounded-lg shadow-md p-6 mb-8 border-t-4 border-[#fdb515]">
          <div className="flex items-center justify-between border-b pb-2 mb-4">
            <h2 className="text-lg font-bold text-gray-800">Filtros de Período Académico</h2>
            <button 
              onClick={() => setIsCatalogModalOpen(true)}
              className="text-gray-400 hover:text-[#fdb515] transition-colors"
              title="Configurar Catálogos"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.894 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Select
              label="Año Académico"
              value={filters.academicYear}
              onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })}
              options={[
                { value: 'Todos los años', label: 'Todos los años' },
                ...academicYears.map((y: any) => ({ value: y.value, label: y.value }))
              ]}
            />
            <Select
              label="Bimestre (Módulo)"
              value={filters.modulo}
              onChange={(e) => setFilters({ ...filters, modulo: e.target.value })}
              options={[
                { value: 'Todos los módulos', label: 'Todos los módulos' },
                ...bimestres.map((b: any) => ({ value: b.value.toString(), label: b.label }))
              ]}
            />
            <Select
              label="Cuatrimestre"
              value={filters.cuatrimestre}
              onChange={(e) => setFilters({ ...filters, cuatrimestre: e.target.value })}
              options={[
                { value: '', label: 'Todos los cuatrimestres' },
                ...cuatrimestres.map((c: any) => ({ value: c.value.toString(), label: c.label }))
              ]}
            />
            <Select
              label="Nivel Académico"
              className="w-full"
              value={filters.nivelAcademico}
              onChange={(e) => {
                setFilters({...filters, nivelAcademico: e.target.value, careerId: ''});
              }}
              options={[
                { value: '', label: 'Seleccionar...' },
                ...academicLevels.map((al: any) => ({ value: al.id, label: al.name }))
              ]}
            />
            <Select
              label="Carrera / Programa"
              className="w-full"
              value={filters.careerId}
              onChange={(e) => setFilters({...filters, careerId: e.target.value})}
              disabled={!filters.nivelAcademico}
              options={[
                { value: '', label: 'Seleccionar...' },
                ...careers.filter((c: any) => c.academicLevelId === filters.nivelAcademico).map((c: any) => ({ value: c.id, label: c.name }))
              ]}
            />
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-100 flex gap-4">
            <Input
              placeholder="Buscar por grupo, asignatura o docente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-1/2"
            />
          </div>
        </div>

        {/* Tablas de Asignaciones Agrupadas por Carrera/Cuatrimestre */}
        <div className="flex flex-col gap-8">
          {filteredGroups.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center border-2 border-dashed border-blue-200">
              <div className="text-6xl mb-4">🏫</div>
              <h3 className="text-2xl font-bold text-[#061266] mb-2">¡Empecemos a organizar tus grupos!</h3>
              <p className="text-gray-600 max-w-lg mx-auto mb-8">
                Las plantillas te permiten definir qué materias lleva cada grupo en el cuatrimestre, facilitando la asignación de maestros después.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-3xl mx-auto mb-8">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="text-blue-600 font-bold mb-2">1. Crea una plantilla</div>
                  <p className="text-sm text-gray-600">Haz clic en "+ Nueva Plantilla" y selecciona la carrera y cuatrimestre.</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl">
                  <div className="text-emerald-600 font-bold mb-2">2. Carga automática</div>
                  <p className="text-sm text-gray-600">El sistema cargará automáticamente todas las materias del catálogo oficial.</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl">
                  <div className="text-amber-600 font-bold mb-2">3. Asigna maestros</div>
                  <p className="text-sm text-gray-600">Ve a la sección "Horarios" para cruzar maestros con estas materias.</p>
                </div>
              </div>
              
              <Button onClick={() => setIsTemplateModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Crear Primera Plantilla
              </Button>
            </div>
          ) : (
            filteredGroups.map((g, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
                {/* Header (Módulo y Promover) */}
                <div className="bg-gray-50 border-b border-gray-200 px-5 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex flex-col">
                    <h3 className="font-bold text-gray-800 uppercase tracking-wide text-sm">{g.label}</h3>
                    <div className="text-xs text-gray-500 font-medium mt-1 flex items-center flex-wrap gap-2">
                      <span>{g.moduloLabel}{g.template.turno ? ` • ${g.template.turno}` : ''}</span>
                      {g.template.createdBy && (
                        <span className="text-blue-600 print:hidden italic border-l border-gray-300 pl-2">
                          Plantilla creada/editada por: {g.template.createdBy.firstName || g.template.createdBy.email.split('@')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button 
                      onClick={() => handleEditTemplate(g.template)}
                      className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 rounded hover:bg-blue-50"
                      title="Editar Plantilla"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button 
                      onClick={() => handleRemoveTemplate(g.template.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-1.5 rounded hover:bg-red-50"
                      title="Eliminar Plantilla"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                    <button 
                      id={`btn-promover-${index}`}
                      onClick={() => handlePromoteClick(g.group, g.template)}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm ml-1 sm:ml-2"
                    >
                      🚀 Promover Ciclo
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-white text-gray-500 border-b border-gray-200">
                      <tr>
                        <th className="px-5 py-3 font-semibold uppercase text-xs w-[25%] tracking-wider">Asignatura</th>
                        <th className="px-5 py-3 font-semibold uppercase text-xs w-[10%] tracking-wider">Grupo</th>
                        <th className="px-5 py-3 font-semibold uppercase text-xs w-[25%] tracking-wider">Docente</th>
                        <th className="px-5 py-3 font-semibold uppercase text-xs w-[20%] tracking-wider">Horario</th>
                        <th className="px-5 py-3 font-semibold uppercase text-xs w-[10%] tracking-wider">Aula</th>
                        <th className="px-5 py-3 font-semibold uppercase text-xs w-[10%] tracking-wider text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {g.assignments.map((a: any, aIndex: number) => {
                        const teacher = teachers.find(t => t.id === a.teacherId);
                        const subject = subjects.find(s => s.id === a.subjectId);
                        
                        return (
                          <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-5 py-3 text-gray-800 font-medium text-xs uppercase">
                              {subject?.name}
                            </td>
                            <td className="px-5 py-3 text-xs uppercase text-gray-600 font-medium">
                              {g.group.name}
                            </td>
                            <td className="px-5 py-3 text-xs uppercase">
                              {teacher ? (
                                <span className="text-gray-700">{teacher.firstName} {teacher.lastName}</span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-600 border border-amber-200">
                                  Pendiente
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-xs uppercase text-gray-600">
                              {a.scheduleDay !== -1 ? `${['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][a.scheduleDay]} ${a.startTime} - ${a.endTime}` : <span className="text-gray-400">---</span>}
                            </td>
                            <td className="px-5 py-3 text-xs uppercase text-gray-600">
                              {a.classroom || <span className="text-gray-400">---</span>}
                            </td>
                            <td className="px-5 py-3 text-xs uppercase text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => {
                                    setEditingAssignment(a);
                                    setAssignmentSubjectName(subject?.name || '');
                                  }}
                                  className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                                  title="Editar línea"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                </button>
                                <button
                                  onClick={() => handleRemoveAssignment(a.id, g.template.id, a.subjectId)}
                                  className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                  title="Remover materia"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <CatalogManagerModal 
        isOpen={isCatalogModalOpen} 
        onClose={() => setIsCatalogModalOpen(false)} 
        onSuccess={() => {
          refreshData();
        }}
      />

      <AssignmentEditModal
        isOpen={!!editingAssignment}
        onClose={() => setEditingAssignment(null)}
        assignment={editingAssignment}
        subjectName={assignmentSubjectName}
        teachers={teachers}
        onSave={handleSaveAssignment}
      />

      <TemplateCreatorModal
        isOpen={isTemplateModalOpen}
        initialData={templateToEdit}
        onClose={() => {
          setIsTemplateModalOpen(false);
          setTimeout(() => setTemplateToEdit(null), 300);
        }}
        onSave={(newTemplate) => {
          const url = '/api/templates';
          const method = templateToEdit ? 'PUT' : 'POST';
          const body = templateToEdit ? { id: templateToEdit.id, ...newTemplate } : newTemplate;
          
          fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          })
          .then(res => res.json())
          .then(data => {
            if (data.error) {
              alert('Error al guardar la plantilla: ' + data.error);
            } else {
              refreshData();
            }
          })
          .catch(err => {
            console.error(err);
            alert('Ocurrió un error inesperado al guardar la plantilla.');
          });
        }}
      />

      {/* Modal de Vista Previa de Promoción */}
      {promotePreview && (
        <Modal 
          isOpen={!!promotePreview} 
          onClose={() => setPromotePreview(null)} 
          title="🚀 Vista Previa de Promoción"
          maxWidth="max-w-2xl"
        >
          <div className="p-6">
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg">
              <h3 className="text-amber-800 font-bold mb-1">Confirmación de Acción Automática</h3>
              <p className="text-sm text-amber-700">
                Estás a punto de promover este grupo. Se creará una <strong>nueva plantilla</strong> para el cuatrimestre siguiente sin afectar los datos actuales del cuatrimestre vigente.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">De (Actual)</p>
                <p className="font-semibold text-gray-900">{promotePreview.group.carrera}</p>
                <p className="text-blue-600">Cuatrimestre {promotePreview.group.cuatrimestre} - Módulo {promotePreview.template.modulo}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm relative">
                <div className="absolute -left-5 top-1/2 -translate-y-1/2 bg-white rounded-full p-1 shadow-sm border text-blue-500">
                  →
                </div>
                <p className="text-xs text-blue-600 uppercase font-bold mb-1">{promotePreview.isNextCuatri ? 'A Sig. Cuatrimestre' : 'A Sig. Bimestre'}</p>
                <p className="font-semibold text-gray-900">{promotePreview.group.carrera}</p>
                <p className="text-emerald-600 font-bold">Cuatrimestre {promotePreview.nextCuatri} - Módulo {promotePreview.nextModulo}</p>
              </div>
            </div>

            <div>
              <p className="font-bold text-gray-900 mb-2 border-b pb-2">
                Nuevas materias a cargar ({promotePreview.nextSubjects.length}):
              </p>
              <ul className="grid grid-cols-2 gap-2 mt-3">
                {promotePreview.nextSubjects.length > 0 ? (
                  promotePreview.nextSubjects.map(sub => (
                    <li key={sub.id} className="text-sm bg-gray-50 p-2 rounded flex items-center gap-2">
                      <span className="text-emerald-500 text-xs">●</span> {sub.name}
                    </li>
                  ))
                ) : (
                  <li className="text-red-500 text-sm col-span-2">No se encontraron materias para este cuatrimestre en el catálogo. Se requiere dar de alta materias primero.</li>
                )}
              </ul>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <Button variant="outline" onClick={() => setPromotePreview(null)}>
                Cancelar
              </Button>
              <Button 
                onClick={confirmPromote} 
                disabled={promotePreview.nextSubjects.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Confirmar y Clonar Plantilla
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
