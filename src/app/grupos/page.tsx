'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button, Badge, Modal, Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  MOCK_ASSIGNMENTS,
  MOCK_SUBJECTS,
  MOCK_GROUPS,
  DAYS_OF_WEEK,
  CUATRIMESTRES,
  MOCK_CARRERAS,
  MOCK_BIMESTRES,
  MOCK_YEARS,
  getSubjectById,
  getGroupById,
} from '@/lib/mockData';
import { Select } from '@/components/ui/Select';
import { CatalogManagerModal } from '@/components/grupos/CatalogManagerModal';

export default function GruposPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    modulo: '1',
    cuatrimestre: '',
    academicYear: '2026-2027',
    carrera: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    fetch('/api/teachers')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTeachers(data.data);
        }
      })
      .catch(err => console.error("Error fetching teachers", err));
  }, []);

  // Agrupar asignaciones por maestro para la tabla
  const teacherAssignments = useMemo(() => {
    const grouped = new Map();
    
    // Solo mostrar maestros que tengan alguna asignación
    const activeTeacherIds = new Set(MOCK_ASSIGNMENTS.map(a => a.teacherId));
    
    teachers.filter(t => activeTeacherIds.has(t.id)).forEach((teacher) => {
      // Filtrar asignaciones del maestro combinando los nuevos filtros
      const assignments = MOCK_ASSIGNMENTS.filter((a) => {
        if (a.teacherId !== teacher.id) return false;
        if (filters.modulo && a.modulo !== Number(filters.modulo)) return false;
        if (filters.cuatrimestre && a.cuatrimestre !== Number(filters.cuatrimestre)) return false;
        
        const group = getGroupById(a.groupId);
        if (!group) return false;
        
        if (filters.academicYear && group.academicYear !== filters.academicYear) return false;
        if (filters.carrera && group.carrera !== filters.carrera) return false;

        return true;
      });
      
      // Si el maestro no tiene asignaciones con estos filtros, no lo mostramos en la tabla
      if (assignments.length > 0) {
        grouped.set(teacher.id, {
          teacher,
          assignments: assignments.sort((a, b) => a.scheduleDay - b.scheduleDay || a.startTime.localeCompare(b.startTime)),
        });
      }
    });
    
    return Array.from(grouped.values());
  }, [filters, refreshTick, teachers]);

  const filteredTeachers = teacherAssignments.filter(({ teacher }) => {
    const search = searchTerm.toLowerCase();
    return (
      teacher.firstName.toLowerCase().includes(search) ||
      teacher.lastName.toLowerCase().includes(search)
    );
  });

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
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-[#061266]">👥 Grupos Académicos y Asignaciones</h1>
          <p className="text-gray-600 mt-2">
            Vista general de asignaciones por docente, materia, horario y CTM (Carrera).
          </p>
        </div>

        {/* Barra de Filtros (Pestañas/Desplegables) */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between border-b pb-2 mb-4">
            <h2 className="text-lg font-bold text-gray-800">Filtros de Período Académico</h2>
            <button 
              onClick={() => setIsCatalogOpen(true)}
              className="text-gray-400 hover:text-[#fdb515] transition-colors"
              title="Configurar Catálogos"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.894 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              label="Año"
              value={filters.academicYear}
              onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })}
              options={[
                { value: '', label: 'Todos los años' },
                ...MOCK_YEARS.map(y => ({ value: y, label: y }))
              ]}
            />
            <Select
              label="Bimestre (Módulo)"
              value={filters.modulo}
              onChange={(e) => setFilters({ ...filters, modulo: e.target.value })}
              options={[
                { value: '', label: 'Todos los bimestres' },
                ...MOCK_BIMESTRES.map(b => ({ value: b.value.toString(), label: b.label }))
              ]}
            />
            <Select
              label="Cuatrimestre"
              value={filters.cuatrimestre}
              onChange={(e) => setFilters({ ...filters, cuatrimestre: e.target.value })}
              options={[
                { value: '', label: 'Todos los cuatrimestres' },
                ...CUATRIMESTRES.map(c => ({ value: c.value.toString(), label: c.label }))
              ]}
            />
            <Select
              label="Carrera"
              value={filters.carrera}
              onChange={(e) => setFilters({ ...filters, carrera: e.target.value })}
              options={[
                { value: '', label: 'Todas las carreras' },
                ...MOCK_CARRERAS.map(c => ({ value: c, label: c }))
              ]}
            />
          </div>
          
          <div className="mt-4 pt-4 border-t flex gap-4">
            <Input
              placeholder="Buscar docente por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-1/2"
            />
          </div>
        </div>

        {/* Tabla Estilo Excel */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-blue-600">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                {/* Header Superior: Módulo */}
                <tr className="bg-blue-600 text-white border-b border-blue-700">
                  <th className="px-4 py-3 text-center border-r border-blue-500 w-1/4 font-bold uppercase tracking-wider">
                    Docente
                  </th>
                  <th colSpan={3} className="px-4 py-3 text-center font-bold uppercase tracking-wider">
                    Asignaciones {filters.modulo ? `- Módulo ${filters.modulo}` : '(Todos los módulos)'}
                  </th>
                </tr>
                {/* Header Inferior: Columnas */}
                <tr className="bg-blue-500 text-white border-b-2 border-blue-700">
                  <th className="px-4 py-2 border-r border-blue-400"></th>
                  <th className="px-4 py-2 text-center border-r border-blue-400 w-1/4 uppercase text-xs font-semibold">
                    Asignatura
                  </th>
                  <th className="px-4 py-2 text-center border-r border-blue-400 w-1/4 uppercase text-xs font-semibold">
                    Horario
                  </th>
                  <th className="px-4 py-2 text-center w-1/4 uppercase text-xs font-semibold">
                    CTM (Carrera / Cuatrimestre)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-gray-500 bg-gray-50">
                      No hay docentes con asignaciones para los filtros seleccionados
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map(({ teacher, assignments }, index) => (
                    <tr key={teacher.id} className="border-b border-gray-300">
                      {/* Columna Docente */}
                      <td className="px-4 py-4 border-r border-gray-300 bg-gray-100 font-bold text-gray-800 uppercase text-xs align-middle">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400 font-normal">{index + 1}</span>
                          {teacher.firstName} {teacher.lastName}
                        </div>
                      </td>
                      
                      {/* Columnas de Asignaciones (Grid interno) */}
                      <td colSpan={3} className="p-0">
                        <table className="w-full h-full border-collapse">
                          <tbody>
                            {assignments.map((a, aIndex) => {
                              const subject = getSubjectById(a.subjectId);
                              const group = getGroupById(a.groupId);
                              const cuatrimestreLabel = CUATRIMESTRES.find(c => c.value === a.cuatrimestre)?.label || `${a.cuatrimestre}er Cuatrimestre`;
                              
                              return (
                                <tr 
                                  key={a.id} 
                                  className={cn(
                                    "bg-[#5cdb5c] hover:bg-[#4bcc4b] transition-colors", // Verde estilo excel de la foto
                                    aIndex < assignments.length - 1 ? "border-b border-gray-300/50" : ""
                                  )}
                                >
                                  {/* Asignatura */}
                                  <td className="px-4 py-2 border-r border-gray-300/50 w-1/3 text-gray-900 font-medium text-xs uppercase leading-relaxed">
                                    {subject?.name}
                                  </td>
                                  
                                  {/* Horario */}
                                  <td className="px-4 py-2 border-r border-gray-300/50 w-1/3 text-gray-900 text-xs uppercase leading-relaxed">
                                    {DAYS_OF_WEEK[a.scheduleDay]} DE {a.startTime} - {a.endTime}
                                  </td>
                                  
                                  {/* CTM */}
                                  <td className="px-4 py-2 w-1/3 text-gray-900 text-xs uppercase leading-relaxed">
                                    <div className="flex flex-col">
                                      <span className="font-semibold">{group?.carrera} {group?.grade}</span>
                                      <span className="text-[10px] opacity-80">{cuatrimestreLabel}</span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CatalogManagerModal 
        isOpen={isCatalogOpen} 
        onClose={() => setIsCatalogOpen(false)} 
        onSuccess={() => setRefreshTick(t => t + 1)}
      />
    </div>
  );
}
