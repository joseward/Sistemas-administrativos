'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  MOCK_SUBJECTS,
  MOCK_GROUPS,
  CUATRIMESTRES,
  MOCK_BIMESTRES,
  getSubjectById,
  getGroupById,
  getStudentsByGroup,
} from '@/lib/mockData';

const DAYS_OF_WEEK: Record<number, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado'
};

export default function AsistenciaPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [selectedModulo, setSelectedModulo] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

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

  // Obtener docentes que tienen clases asignadas
  const teachersWithAssignments = useMemo(() => {
    const activeTeacherIds = new Set(assignments.map(a => a.teacherId));
    return teachers.filter(t => activeTeacherIds.has(t.id));
  }, [teachers, assignments]);

  // Asignaciones del maestro seleccionado filtradas por módulo
  const teacherAssignments = useMemo(() => {
    if (!selectedTeacherId) return [];
    return assignments.filter(a => a.teacherId === selectedTeacherId && !a.isAvailable);
  }, [selectedTeacherId, assignments]);

  const filteredAssignments = useMemo(() => {
    if (!selectedModulo) return [];
    return teacherAssignments.filter(a => a.modulo === Number(selectedModulo));
  }, [teacherAssignments, selectedModulo]);

  // Si cambia el maestro, reiniciar el módulo
  useEffect(() => {
    setSelectedModulo('');
  }, [selectedTeacherId]);

  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);

  // Función para imprimir
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-transparent p-6 print:bg-white print:p-0">
      <div className="max-w-5xl mx-auto">
        {/* Controles (No visibles al imprimir) */}
        <div className="print:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-6 transition-colors group"
          >
            <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
            Regresar al inicio
          </Link>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-[#061266]">✅ Control de Asistencia</h1>
              <p className="text-gray-600 mt-2">
                Selecciona un maestro y su clase para generar la lista de asistencia imprimible.
              </p>
            </div>
          </div>

          {/* Panel de Selección */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Selector de Maestro */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">1. Seleccionar Maestro</label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Elija un maestro --</option>
                  {teachersWithAssignments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector de Bimestre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">2. Bimestre (Módulo)</label>
                <select
                  value={selectedModulo}
                  onChange={(e) => setSelectedModulo(e.target.value)}
                  disabled={!selectedTeacherId || teacherAssignments.length === 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">-- Elija un bimestre --</option>
                  {MOCK_BIMESTRES.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector de Fecha y Botón Imprimir */}
              <div className="flex flex-col">
                <label className="block text-sm font-semibold text-gray-700 mb-2">3. Fecha</label>
                <div className="flex gap-3">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    onClick={handlePrint}
                    disabled={!selectedModulo || filteredAssignments.length === 0}
                    className="flex items-center gap-2"
                  >
                    🖨️ Imprimir
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* DOCUMENTO IMPRIMIBLE (ASISTENCIA DOCENTE) */}
        {/* ============================================================== */}
        {selectedTeacher && selectedModulo && filteredAssignments.length > 0 && (
          <div className="print:block">
            <div className="bg-white rounded-lg shadow-lg p-8 print:shadow-none print:p-0 mb-8">
              
              {/* Cabecera del documento */}
              <div className="border-b-2 border-gray-800 pb-4 mb-6 flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wider">Universidad Aztlán Playa del Carmen</h2>
                  <h3 className="text-lg font-semibold text-gray-700 mt-1">Control de Asistencia Docente</h3>
                </div>
                <div className="text-right text-sm">
                  <p><span className="font-bold">Fecha:</span> {new Date(selectedDate).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p><span className="font-bold">Bimestre:</span> {MOCK_BIMESTRES.find(b => b.value === selectedModulo)?.label || selectedModulo}</p>
                </div>
              </div>

              {/* Información del Maestro */}
              <div className="grid grid-cols-2 gap-4 mb-8 text-sm border border-gray-300 rounded-lg p-4 bg-gray-50 print:bg-white print:border-gray-400">
                <div className="space-y-2">
                  <p><span className="font-bold text-gray-700 w-24 inline-block">Docente:</span> <span className="uppercase">{selectedTeacher.firstName} {selectedTeacher.lastName}</span></p>
                  <p><span className="font-bold text-gray-700 w-24 inline-block">E-mail:</span> {selectedTeacher.email}</p>
                </div>
                <div className="space-y-2">
                  <p><span className="font-bold text-gray-700 w-24 inline-block">Teléfono:</span> {selectedTeacher.phone || 'N/A'}</p>
                  <p><span className="font-bold text-gray-700 w-24 inline-block">Especialidad:</span> {selectedTeacher.specialization || 'N/A'}</p>
                </div>
              </div>

              {/* Tabla de Asistencia (Materias) */}
              <div className="mb-12">
                <table className="w-full text-sm border-collapse border border-gray-400">
                  <thead>
                    <tr className="bg-gray-100 print:bg-gray-100">
                      <th className="border border-gray-400 px-3 py-2 w-12 text-center">No.</th>
                      <th className="border border-gray-400 px-3 py-2 text-left">Materia / Grupo</th>
                      <th className="border border-gray-400 px-3 py-2 w-48 text-center">Horario de la Materia</th>
                      <th className="border border-gray-400 px-3 py-2 w-24 text-center">Asistencia</th>
                      <th className="border border-gray-400 px-3 py-2 w-48 text-center">Firma del Docente</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssignments.map((assignment, idx) => {
                      const subject = getSubjectById(assignment.subjectId);
                      const group = getGroupById(assignment.groupId);
                      return (
                        <tr key={assignment.id} className="print:break-inside-avoid">
                          <td className="border border-gray-400 px-3 py-4 text-center">{idx + 1}</td>
                          <td className="border border-gray-400 px-3 py-4 uppercase">
                            <div className="font-bold">{subject?.name}</div>
                            <div className="text-xs text-gray-600 mt-1">{group?.carrera} - {group?.name}</div>
                          </td>
                          <td className="border border-gray-400 px-3 py-4 text-center text-gray-800 uppercase">
                            {DAYS_OF_WEEK[assignment.scheduleDay]}<br/>
                            {assignment.startTime} a {assignment.endTime} hrs.
                          </td>
                          <td className="border border-gray-400 px-3 py-4 text-center">
                             <div className="w-6 h-6 border-2 border-gray-400 mx-auto rounded-sm print:border-black"></div>
                          </td>
                          <td className="border border-gray-400 px-3 py-4"></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Sección de Firmas de Coordinación */}
              <div className="mt-24 grid grid-cols-2 gap-12 px-12">
                <div className="text-center">
                  <div className="border-t border-black pt-2">
                    <p className="font-bold text-sm uppercase">{selectedTeacher.firstName} {selectedTeacher.lastName}</p>
                    <p className="text-xs text-gray-600">Firma de Conformidad del Docente</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="border-t border-black pt-2">
                    <p className="font-bold text-sm uppercase">Coordinación Académica</p>
                    <p className="text-xs text-gray-600">Sello y Validación</p>
                  </div>
                </div>
              </div>

              {/* Footer de impresión */}
              <div className="mt-16 text-center text-[10px] text-gray-400 print:block">
                Generado por el Sistema Administrativo Escolar — {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Mensaje cuando no hay nada seleccionado */}
        {!selectedModulo && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200 border-dashed print:hidden">
            <span className="text-4xl block mb-4">📋</span>
            <h3 className="text-lg font-semibold text-gray-700">No hay maestro o bimestre seleccionado</h3>
            <p className="text-gray-500 mt-2">
              Selecciona un maestro y el bimestre en la parte superior para generar su reporte de asistencia.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
