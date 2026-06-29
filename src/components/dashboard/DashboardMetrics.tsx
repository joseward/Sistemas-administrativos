'use client';

import React, { useEffect, useState } from 'react';
import { MOCK_GROUP_TEMPLATES, MOCK_TEACHERS } from '@/lib/mockData';

export function DashboardMetrics() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/assignments').then(res => res.json()),
      fetch('/api/availability').then(res => res.json())
    ])
      .then(([assignData, availData]) => {
        if (assignData.success) {
          setAssignments(assignData.data);
        }
        if (availData.success) {
          setAvailability(availData.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching dashboard metrics", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="h-24 animate-pulse bg-gray-100 rounded-lg mb-8"></div>;
  }

  // 1. Plantillas Incompletas (Rojo)
  let incompleteTemplates = 0;
  let completeTemplates = 0;

  MOCK_GROUP_TEMPLATES.forEach(tpl => {
    let missingSubjects = 0;
    tpl.subjectIds.forEach(subjectId => {
      const isAssigned = assignments.some(a => 
        a.groupId === tpl.groupId &&
        a.modulo === tpl.modulo &&
        a.subjectId === subjectId &&
        a.teacherId && a.teacherId !== 'mock-t-unassigned' &&
        !a.isAvailable // meaning it's an actual assignment, not just availability
      );
      if (!isAssigned) missingSubjects++;
    });

    if (missingSubjects > 0) {
      incompleteTemplates++;
    } else {
      completeTemplates++;
    }
  });

  // 2. Maestros sin disponibilidad (Amarillo)
  const activeTeachers = MOCK_TEACHERS.filter(t => t.contractStatus === 'active');
  let missingAvailabilityCount = 0;

  activeTeachers.forEach(t => {
    const hasAvailability = availability.some(a => a.teacherId === t.id);
    if (!hasAvailability) {
      missingAvailabilityCount++;
    }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Tarjeta Roja: Faltan Asignaciones */}
      <div className="bg-red-50 rounded-xl p-6 border-l-4 border-red-500 shadow-sm flex flex-col justify-between">
        <div>
          <p className="text-sm font-bold text-red-700 uppercase tracking-wide">Atención Requerida</p>
          <h3 className="text-3xl font-black text-red-900 mt-2">{incompleteTemplates}</h3>
          <p className="text-red-800 text-sm mt-1">Plantillas con materias sin maestro asignado</p>
        </div>
      </div>

      {/* Tarjeta Amarilla: Faltan Horarios de Maestros */}
      <div className="bg-amber-50 rounded-xl p-6 border-l-4 border-amber-500 shadow-sm flex flex-col justify-between">
        <div>
          <p className="text-sm font-bold text-amber-700 uppercase tracking-wide">Pendientes de Docentes</p>
          <h3 className="text-3xl font-black text-amber-900 mt-2">{missingAvailabilityCount}</h3>
          <p className="text-amber-800 text-sm mt-1">Maestros activos que no han enviado su disponibilidad</p>
        </div>
      </div>

      {/* Tarjeta Verde: Todo en Orden */}
      <div className="bg-emerald-50 rounded-xl p-6 border-l-4 border-emerald-500 shadow-sm flex flex-col justify-between">
        <div>
          <p className="text-sm font-bold text-emerald-700 uppercase tracking-wide">Cobertura Exitosa</p>
          <h3 className="text-3xl font-black text-emerald-900 mt-2">{completeTemplates}</h3>
          <p className="text-emerald-800 text-sm mt-1">Plantillas completadas al 100%</p>
        </div>
      </div>
    </div>
  );
}
