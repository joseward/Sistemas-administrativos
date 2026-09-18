'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Button, Badge, Modal, Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { MOCK_ASSIGNMENTS, MockGroupTemplate, DAYS_OF_WEEK } from '@/lib/mockData';
import { Select } from '@/components/ui/Select';
import { CatalogManagerModal } from '@/components/grupos/CatalogManagerModal';
import { AssignmentEditModal } from '@/components/grupos/AssignmentEditModal';
import { TemplateCreatorModal } from '@/components/grupos/TemplateCreatorModal';
import { CloneTemplateModal } from '@/components/grupos/CloneTemplateModal';
import { useCurriculum } from '@/context/CurriculumContext';
import { Copy, Plus, Trash2, Edit3, ArrowRight, Layers, Building2, Clock, Check, Sparkles, GraduationCap, School, TrendingUp, Users, ArrowLeft } from 'lucide-react';

export default function GruposPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    academicYear: 'Todos los años',
    modulo: '',
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
  
  // Estado para gestión rápida de módulos y clonación
  const [activeModules, setActiveModules] = useState<Record<string, number>>({});
  const [cloningData, setCloningData] = useState<{ template: any; group: any } | null>(null);
  const [addingSubjectToTemplateId, setAddingSubjectToTemplateId] = useState<string | null>(null);

  // Promote Preview State
  const [promotePreview, setPromotePreview] = useState<{group: any, template: MockGroupTemplate, nextCuatri: number, nextModulo: number, nextSubjects: any[], isNextCuatri: boolean} | null>(null);
  const [templateToEdit, setTemplateToEdit] = useState<MockGroupTemplate | null>(null);

  const [assignments, setAssignments] = useState<any[]>(MOCK_ASSIGNMENTS);
  const { academicLevels = [], careers = [], subjects = [], groups = [], templates = [], academicYears = [], bimestres = [], cuatrimestres = [], classrooms = [], refreshData = () => {} } = useCurriculum() || {};

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

  // Construir las tablas a partir de los Grupos y sus Plantillas (Consolidadas por Grupo)
  const groupedAssignments = useMemo(() => {
    const grouped = new Map<string, any>();
    
    // 1. Recorrer los grupos filtrados
    groups.forEach((group: any) => {
      const career = careers.find((c: any) => c.id === group.careerId);
      const carreraName = career?.name || group.carrera || 'Carrera';

      if (filters.academicYear && filters.academicYear !== 'Todos los años' && group.academicYear !== filters.academicYear) return;
      if (filters.cuatrimestre && group.cuatrimestre !== Number(filters.cuatrimestre)) return;
      if (filters.nivelAcademico && career?.academicLevelId !== filters.nivelAcademico) return;
      if (filters.careerId && group.careerId !== filters.careerId) return;

      const cuatriLabel = cuatrimestres.find((c: any) => c.value === group.cuatrimestre)?.label || `${group.cuatrimestre}er Cuatrimestre`;
      const label = `${carreraName} - ${cuatriLabel} - Grupo ${group.name}`;

      grouped.set(group.id, {
        groupId: group.id,
        group,
        careerName: carreraName,
        cuatriLabel,
        label,
        modules: {
          1: { template: null as any, assignments: [] as any[] },
          2: { template: null as any, assignments: [] as any[] }
        }
      });
    });

    // 2. Asociar plantillas a cada grupo por módulo (evitando duplicados vacíos)
    templates.forEach((tpl: any) => {
      const groupData = grouped.get(tpl.groupId);
      if (!groupData) return;

      const mod = tpl.modulo === 2 ? 2 : 1;
      const modEntry = groupData.modules[mod];

      if (!modEntry.template || (tpl.subjectIds?.length || 0) > (modEntry.template.subjectIds?.length || 0)) {
        modEntry.template = tpl;
      }
    });

    // 3. Poblar las asignaciones de cada módulo
    grouped.forEach((groupData) => {
      [1, 2].forEach((modNum) => {
        const modEntry = groupData.modules[modNum as 1 | 2];
        if (!modEntry.template) return;

        const tpl = modEntry.template;
        const subjectIds = tpl.subjectIds || [];

        subjectIds.forEach((subjectId: string) => {
          const assignment = assignments.find((a: any) => 
            a.groupId === tpl.groupId && 
            a.modulo === tpl.modulo && 
            a.subjectId === subjectId
          );

          if (assignment) {
            modEntry.assignments.push(assignment);
          } else {
            modEntry.assignments.push({
              id: `unassigned-${tpl.id}-${subjectId}`,
              subjectId,
              teacherId: null,
              groupId: tpl.groupId,
              modulo: tpl.modulo,
              cuatrimestre: groupData.group.cuatrimestre,
              academicYear: groupData.group.academicYear || '2026-2027',
              classroom: tpl.classroom,
              scheduleDay: -1,
              startTime: tpl.startTime || '',
              endTime: tpl.endTime || ''
            });
          }
        });
      });
    });

    // Solo conservar grupos que tengan al menos una plantilla
    const result = Array.from(grouped.values()).filter(g => g.modules[1].template !== null || g.modules[2].template !== null);
    
    // Si hay filtro por módulo específico, filtrar solo los que tienen ese módulo
    if (filters.modulo) {
      const targetMod = Number(filters.modulo) as 1 | 2;
      return result.filter(g => g.modules[targetMod].template !== null);
    }

    return result;
  }, [templates, assignments, filters, groups, careers, cuatrimestres]);

  // Aplicar filtro de búsqueda general
  const filteredGroups = useMemo(() => {
    if (!searchTerm) return groupedAssignments;
    const search = searchTerm.toLowerCase();
    
    return groupedAssignments.filter(g => {
      const groupMatch = g.group?.name?.toLowerCase().includes(search) || g.label?.toLowerCase().includes(search);
      if (groupMatch) return true;

      const matchM1 = g.modules[1].assignments.some((a: any) => {
        const subject = subjects.find(s => s.id === a.subjectId);
        const teacher = teachers.find(t => t.id === a.teacherId);
        return subject?.name?.toLowerCase().includes(search) || 
               (teacher && `${teacher.firstName} ${teacher.lastName}`.toLowerCase().includes(search));
      });

      const matchM2 = g.modules[2].assignments.some((a: any) => {
        const subject = subjects.find(s => s.id === a.subjectId);
        const teacher = teachers.find(t => t.id === a.teacherId);
        return subject?.name?.toLowerCase().includes(search) || 
               (teacher && `${teacher.firstName} ${teacher.lastName}`.toLowerCase().includes(search));
      });

      return matchM1 || matchM2;
    });
  }, [groupedAssignments, searchTerm, subjects, teachers]);

  const groupsByCareer = useMemo(() => {
    const byCareer = new Map<string, typeof filteredGroups>();
    filteredGroups.forEach(g => {
      const carreraName = g.careerName || 'Grupos sin Carrera';
      if (!byCareer.has(carreraName)) byCareer.set(carreraName, []);
      byCareer.get(carreraName)!.push(g);
    });
    return Array.from(byCareer.entries());
  }, [filteredGroups]);

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

  const confirmPromote = async () => {
    if (!promotePreview) return;
    const { group, template, nextCuatri, nextModulo, nextSubjects, isNextCuatri } = promotePreview;

    if (nextSubjects.length === 0) {
      alert(`No se puede promover: No hay materias registradas en el catálogo para el Cuatrimestre ${nextCuatri}.`);
      setPromotePreview(null);
      return;
    }

    let newGroupId = group.id;

    try {
      if (isNextCuatri) {
        const newGroupName = window.prompt(
          `¡Promoción a nuevo cuatrimestre!\n\nPor favor, ingresa el nombre para el NUEVO grupo del Cuatrimestre ${nextCuatri}:`, 
          group.name
        );
        
        if (!newGroupName) {
          // El usuario canceló el prompt
          setPromotePreview(null);
          return; 
        }

        // Crear el nuevo grupo para el próximo cuatrimestre en la BD
        const res = await fetch('/api/groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newGroupName,
            careerId: group.careerId,
            cuatrimestre: nextCuatri,
            academicYear: group.academicYear,
            schoolId: group.schoolId,
            modality: group.modality
          })
        });
        const createdGroup = await res.json();
        if (createdGroup.error) {
          alert('Error creando el grupo para el nuevo cuatrimestre: ' + createdGroup.error);
          return;
        }
        newGroupId = createdGroup.id;
      }

      const newTemplate = {
        groupId: newGroupId,
        modulo: nextModulo,
        turno: template.turno,
        classroom: template.classroom,
        subjectIds: nextSubjects.map(s => s.id),
      };

      const resTpl = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate)
      });
      const createdTpl = await resTpl.json();
      
      if (createdTpl.error) {
        alert('Error creando la plantilla: ' + createdTpl.error);
        return;
      }

      setPromotePreview(null);
      refreshData();
    } catch (err) {
      console.error(err);
      alert('Hubo un error al promover el ciclo.');
    }
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
      const res = await fetch('/api/assignments/single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedAssignment)
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert('Error al guardar la asignación: ' + (data.error || 'Desconocido'));
        return;
      }
      
      refreshData();
    } catch (err) {
      console.error('Error saving assignment:', err);
      alert('Error de conexión al guardar la asignación');
    }
    setEditingAssignment(null);
  };

  const handleRemoveAssignment = async (assignmentId: string, templateId: string, subjectId: string) => {
    try {
      // Update local assignments state if it was a real assignment
      if (assignmentId && !assignmentId.startsWith('unassigned-')) {
        setAssignments(prev => prev.filter(a => a.id !== assignmentId));
      }
      
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

  const handleAddSubjectToTemplate = async (templateId: string, subjectId: string) => {
    try {
      const res = await fetch('/api/templates/add-subject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, subjectId })
      });
      const data = await res.json();
      if (data.success) {
        refreshData();
      } else {
        alert('Error al agregar materia: ' + (data.error || 'Desconocido'));
      }
    } catch (err) {
      console.error('Error adding subject to template:', err);
      alert('Error de conexión al agregar materia.');
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
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Regresar al inicio
        </Link>

        {/* Header */}
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-[#061266] flex items-center gap-3">
              <Users className="w-9 h-9 text-blue-600" />
              Grupos Académicos
            </h1>
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
              <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                <School className="w-10 h-10" />
              </div>
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
            groupsByCareer.map(([careerName, careerGroups]) => (
              <div key={careerName} className="mb-10">
                <div className="flex items-center gap-4 mb-6 mt-2">
                  <h2 className="text-xl font-black text-[#061266] uppercase tracking-wide">{careerName}</h2>
                  <div className="h-px bg-gray-200 flex-1"></div>
                  <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                    {careerGroups.length} Grupo{careerGroups.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {careerGroups.map((g, index) => {
                  const defaultMod = g.modules[1].template ? 1 : (g.modules[2].template ? 2 : 1);
                  const currentModulo = activeModules[g.groupId] || defaultMod;
                  const currentModData = g.modules[currentModulo as 1 | 2];
                  const currentTemplate = currentModData?.template;
                  const currentAssignments = currentModData?.assignments || [];

                  const existingSubjectIds = new Set(currentTemplate?.subjectIds || []);
                  const unaddedSubjects = subjects.filter((s: any) => 
                    s.careerId === g.group.careerId && !existingSubjectIds.has(s.id)
                  );

                  return (
                    <div key={g.groupId} className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                      {/* Header (Datos del Grupo y Acciones) */}
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50/40 border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-gray-900 tracking-tight text-base uppercase">
                              Grupo {g.group.name}
                            </h3>
                            <span className="text-gray-300">·</span>
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                              {g.cuatriLabel}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                              {g.careerName}
                            </span>
                          </div>

                          <div className="text-xs text-gray-500 font-medium mt-1 flex items-center flex-wrap gap-2">
                            {currentTemplate && (
                              <>
                                <span className="inline-flex items-center gap-1 font-semibold text-gray-700 bg-white px-2 py-0.5 rounded border border-gray-200">
                                  <Clock className="w-3 h-3 text-gray-400" />
                                  Turno: {currentTemplate.turno || 'Sabatino'}
                                </span>
                                <span className="inline-flex items-center gap-1 font-semibold text-gray-700 bg-white px-2 py-0.5 rounded border border-gray-200">
                                  <Building2 className="w-3 h-3 text-gray-400" />
                                  Aula: {currentTemplate.classroom || 'Sin Aula'}
                                </span>
                                {currentTemplate.createdBy && (
                                  <span className="text-blue-600 print:hidden italic border-l border-gray-300 pl-2">
                                    Creada/editada por: {currentTemplate.createdBy.firstName || currentTemplate.createdBy.email.split('@')[0]}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Acciones principales de la cabecera */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {currentTemplate && (
                            <>
                              <button
                                onClick={() => setCloningData({ template: currentTemplate, group: g.group })}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-white border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors shadow-2xs"
                                title="Copiar estas materias a otro grupo"
                              >
                                <Copy className="w-3.5 h-3.5 text-blue-600" />
                                <span>Clonar Plantilla</span>
                              </button>

                              <button 
                                onClick={() => handleEditTemplate(currentTemplate)}
                                className="text-gray-500 hover:text-blue-600 transition-colors p-1.5 rounded-xl border border-gray-200 bg-white hover:bg-blue-50"
                                title="Editar Plantilla"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              <button 
                                onClick={() => handleRemoveTemplate(currentTemplate.id)}
                                className="text-gray-500 hover:text-red-600 transition-colors p-1.5 rounded-xl border border-gray-200 bg-white hover:bg-red-50"
                                title="Eliminar Plantilla de este módulo"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>

                              <button 
                                id={`btn-promover-${index}`}
                                onClick={() => handlePromoteClick(g.group, currentTemplate)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-2xs"
                              >
                                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                                Promover Ciclo
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Pestañas de Módulos (Módulo 1 / Módulo 2) */}
                      <div className="bg-gray-100/70 border-b border-gray-200 px-6 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {[1, 2].map((modNum) => {
                            const hasTpl = g.modules[modNum as 1 | 2].template !== null;
                            const count = g.modules[modNum as 1 | 2].assignments.length;
                            const isActive = currentModulo === modNum;

                            return (
                              <button
                                key={modNum}
                                onClick={() => setActiveModules(prev => ({ ...prev, [g.groupId]: modNum }))}
                                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                                  isActive
                                    ? 'bg-white text-blue-900 shadow-xs border border-gray-200'
                                    : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'
                                }`}
                              >
                                <span>Módulo {modNum}</span>
                                {hasTpl ? (
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                    isActive ? 'bg-blue-50 text-blue-700' : 'bg-gray-200 text-gray-600'
                                  }`}>
                                    {count} {count === 1 ? 'materia' : 'materias'}
                                  </span>
                                ) : (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded text-gray-400 font-normal">
                                    Vacío
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {currentTemplate && (
                          <span className="text-xs text-gray-500 font-medium">
                            {currentAssignments.filter((a: any) => a.teacherId).length} de {currentAssignments.length} docentes asignados
                          </span>
                        )}
                      </div>

                      {/* Tabla de Materias para el Módulo Activo */}
                      {currentTemplate ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-white text-gray-400 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider">
                              <tr>
                                <th className="px-6 py-3 w-[28%]">Asignatura</th>
                                <th className="px-5 py-3 w-[10%]">Grupo</th>
                                <th className="px-5 py-3 w-[25%]">Docente Asignado</th>
                                <th className="px-5 py-3 w-[19%]">Horario</th>
                                <th className="px-5 py-3 w-[10%]">Aula</th>
                                <th className="px-5 py-3 w-[8%] text-center">Acción</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                              {currentAssignments.map((a: any) => {
                                const teacher = teachers.find(t => t.id === a.teacherId);
                                const subject = subjects.find(s => s.id === a.subjectId);

                                return (
                                  <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-3 text-gray-900 font-semibold text-xs">
                                      {subject?.name}
                                      {subject?.code && (
                                        <span className="text-[10px] text-gray-400 font-mono block mt-0.5">
                                          Clave: {subject.code}
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-5 py-3 text-xs uppercase text-gray-600 font-medium">
                                      {g.group.name}
                                    </td>
                                    <td className="px-5 py-3 text-xs">
                                      {teacher ? (
                                        <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center">
                                            {teacher.firstName?.[0] || 'D'}
                                          </div>
                                          <span className="text-gray-800 font-medium">
                                            {teacher.firstName} {teacher.lastName}
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                                          Pendiente
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-5 py-3 text-xs font-mono text-gray-600">
                                      {a.scheduleDay !== -1 && a.scheduleDay != null 
                                        ? `${DAYS_OF_WEEK[a.scheduleDay] || ''} ${a.startTime || '--:--'} - ${a.endTime || '--:--'}` 
                                        : (a.startTime && a.endTime ? `Sin día | ${a.startTime} - ${a.endTime}` : <span className="text-gray-400">---</span>)}
                                    </td>
                                    <td className="px-5 py-3 text-xs font-medium text-gray-700">
                                      <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">
                                        {a.classroom || currentTemplate.classroom || '---'}
                                      </span>
                                    </td>
                                    <td className="px-5 py-3 text-xs text-center">
                                      <button
                                        onClick={() => handleRemoveAssignment(a.id, currentTemplate.id, a.subjectId)}
                                        className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                        title="Quitar materia de este grupo"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}

                              {/* FILA INTERACTIVA: AGREGAR MATERIA A ESTE MÓDULO */}
                              {addingSubjectToTemplateId === currentTemplate.id ? (
                                <tr className="bg-blue-50/60">
                                  <td colSpan={6} className="px-6 py-3">
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs font-bold text-blue-900 flex-shrink-0">
                                        Selecciona la materia a agregar:
                                      </span>
                                      <select
                                        className="text-xs px-3 py-1.5 border border-blue-300 rounded-xl bg-white text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 flex-1 max-w-md"
                                        defaultValue=""
                                        onChange={(e) => {
                                          if (e.target.value) {
                                            handleAddSubjectToTemplate(currentTemplate.id, e.target.value);
                                            setAddingSubjectToTemplateId(null);
                                          }
                                        }}
                                      >
                                        <option value="">-- Elige una materia del catálogo --</option>
                                        {unaddedSubjects.map((s: any) => (
                                          <option key={s.id} value={s.id}>{s.name} ({s.code || 'Sin clave'})</option>
                                        ))}
                                      </select>
                                      <button
                                        type="button"
                                        onClick={() => setAddingSubjectToTemplateId(null)}
                                        className="text-xs text-gray-500 hover:text-gray-700 font-semibold px-2 py-1"
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ) : (
                                <tr className="border-t border-dashed border-gray-200 hover:bg-blue-50/30 transition-colors">
                                  <td colSpan={6} className="px-6 py-3">
                                    <button
                                      type="button"
                                      onClick={() => setAddingSubjectToTemplateId(currentTemplate.id)}
                                      className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1.5 transition-colors"
                                    >
                                      <Plus className="w-4 h-4" />
                                      <span>Agregar Materia a este Módulo</span>
                                    </button>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-8 text-center bg-gray-50/50">
                          <Layers className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                          <p className="text-xs font-semibold text-gray-600 mb-3">
                            El Grupo {g.group.name} aún no tiene materias asignadas en el Módulo {currentModulo}.
                          </p>
                          <Button
                            size="sm"
                            onClick={() => {
                              setTemplateToEdit(null);
                              setIsTemplateModalOpen(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                          >
                            + Crear Plantilla para Módulo {currentModulo}
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
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

      <CloneTemplateModal
        isOpen={!!cloningData}
        onClose={() => setCloningData(null)}
        sourceTemplate={cloningData?.template}
        sourceGroup={cloningData?.group}
        allGroups={groups}
        classrooms={classrooms}
        onCloneSuccess={() => {
          refreshData();
        }}
      />

      {/* Modal de Vista Previa de Promoción */}
      {promotePreview && (
        <Modal 
          isOpen={!!promotePreview} 
          onClose={() => setPromotePreview(null)} 
          title="Vista Previa de Promoción"
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
                <p className="font-semibold text-gray-900">{promotePreview.group.career?.name || promotePreview.group.name}</p>
                <p className="text-blue-600">Cuatrimestre {promotePreview.group.cuatrimestre} - Módulo {promotePreview.template.modulo}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm relative">
                <div className="absolute -left-5 top-1/2 -translate-y-1/2 bg-white rounded-full p-1 shadow-sm border text-blue-500">
                  →
                </div>
                <p className="text-xs text-blue-600 uppercase font-bold mb-1">{promotePreview.isNextCuatri ? 'A Sig. Cuatrimestre' : 'A Sig. Bimestre'}</p>
                <p className="font-semibold text-gray-900">{promotePreview.group.career?.name || promotePreview.group.name}</p>
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
