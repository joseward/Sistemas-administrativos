'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Button, Badge, Modal, Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
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

  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/teachers')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTeachers(data.data);
        }
      })
      .catch(err => console.error("Error fetching teachers", err));

    fetch('/api/assignments')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAssignments(data.data);
        }
      })
      .catch(err => console.error("Error fetching assignments", err));
  }, []);

  // Agrupar asignaciones por grupo/carrera para la tabla
  const groupedAssignments = useMemo(() => {
    const grouped = new Map();
    
    assignments.forEach((a) => {
      if (filters.modulo && a.modulo !== Number(filters.modulo)) return;
      if (filters.cuatrimestre && a.cuatrimestre !== Number(filters.cuatrimestre)) return;
      
      const group = getGroupById(a.groupId);
      if (!group) return;
      
      if (filters.academicYear && group.academicYear !== filters.academicYear) return;
      if (filters.carrera && group.carrera !== filters.carrera) return;

      const cuatriLabel = CUATRIMESTRES.find(c => c.value === a.cuatrimestre)?.label || `${a.cuatrimestre}er Cuatrimestre`;
      const groupKey = `${group.carrera} - ${cuatriLabel}`;
      
      if (!grouped.has(groupKey)) {
        grouped.set(groupKey, {
          label: groupKey,
          moduloLabel: filters.modulo ? `Módulo ${filters.modulo}` : `Módulo ${a.modulo}`,
          assignments: [],
        });
      }
      
      grouped.get(groupKey).assignments.push(a);
    });
    
    // Convertir a array y ordenar por día y hora
    const result = Array.from(grouped.values());
    result.forEach(g => {
      g.assignments.sort((a: any, b: any) => {
        if (a.scheduleDay !== b.scheduleDay) return a.scheduleDay - b.scheduleDay;
        return a.startTime.localeCompare(b.startTime);
      });
    });
    
    return result;
  }, [assignments, filters, refreshTick]);

  // Aplicar filtro de búsqueda de docente
  const filteredGroups = useMemo(() => {
    if (!searchTerm) return groupedAssignments;
    const search = searchTerm.toLowerCase();
    
    return groupedAssignments.map(g => {
      const filteredAsgs = g.assignments.filter((a: any) => {
        const teacher = teachers.find(t => t.id === a.teacherId);
        if (!teacher) return false;
        return (
          teacher.firstName.toLowerCase().includes(search) ||
          teacher.lastName.toLowerCase().includes(search)
        );
      });
      return { ...g, assignments: filteredAsgs };
    }).filter(g => g.assignments.length > 0);
  }, [groupedAssignments, teachers, searchTerm]);

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

        {/* Tablas de Asignaciones Agrupadas por Carrera/Cuatrimestre */}
        <div className="flex flex-col gap-8">
          {filteredGroups.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500 border border-blue-600">
              No hay asignaciones para los filtros seleccionados
            </div>
          ) : (
            filteredGroups.map((g, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden border border-blue-600">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      {/* Header Superior: Grupo y Módulo */}
                      <tr className="bg-blue-600 text-white border-b border-blue-700">
                        <th colSpan={2} className="px-4 py-3 text-left border-r border-blue-500 w-1/2 font-bold uppercase tracking-wider">
                          {g.label}
                        </th>
                        <th colSpan={2} className="px-4 py-3 text-left font-bold uppercase tracking-wider">
                          {g.moduloLabel}
                        </th>
                      </tr>
                      {/* Header Inferior: Columnas */}
                      <tr className="bg-blue-500 text-white border-b-2 border-blue-700">
                        <th className="px-4 py-2 text-center border-r border-blue-400 w-[30%] uppercase text-xs font-semibold">
                          Asignatura
                        </th>
                        <th className="px-4 py-2 text-center border-r border-blue-400 w-[25%] uppercase text-xs font-semibold">
                          Docente
                        </th>
                        <th className="px-4 py-2 text-center border-r border-blue-400 w-[25%] uppercase text-xs font-semibold">
                          Horario
                        </th>
                        <th className="px-4 py-2 text-center w-[20%] uppercase text-xs font-semibold">
                          Aula
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {g.assignments.map((a: any, aIndex: number) => {
                        const teacher = teachers.find(t => t.id === a.teacherId);
                        const subject = getSubjectById(a.subjectId);
                        
                        return (
                          <tr 
                            key={a.id} 
                            className={cn(
                              "bg-[#5cdb5c] hover:bg-[#4bcc4b] transition-colors", // Verde estilo excel
                              aIndex < g.assignments.length - 1 ? "border-b border-gray-300/50" : ""
                            )}
                          >
                            {/* Asignatura */}
                            <td className="px-4 py-3 border-r border-gray-300/50 text-gray-900 font-medium text-xs uppercase leading-relaxed text-center">
                              {subject?.name}
                            </td>
                            
                            {/* Docente */}
                            <td className="px-4 py-3 border-r border-gray-300/50 text-gray-900 text-xs uppercase leading-relaxed text-center">
                              {teacher ? `${teacher.firstName} ${teacher.lastName}` : 'No asignado'}
                            </td>
                            
                            {/* Horario */}
                            <td className="px-4 py-3 border-r border-gray-300/50 text-gray-900 text-xs uppercase leading-relaxed text-center">
                              {DAYS_OF_WEEK[a.scheduleDay]} {a.startTime} - {a.endTime}
                            </td>
                            
                            {/* Aula */}
                            <td className="px-4 py-3 text-gray-900 text-xs uppercase leading-relaxed text-center">
                              {a.classroom || ''}
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
        isOpen={isCatalogOpen} 
        onClose={() => setIsCatalogOpen(false)} 
        onSuccess={() => setRefreshTick(t => t + 1)}
      />
    </div>
  );
}
