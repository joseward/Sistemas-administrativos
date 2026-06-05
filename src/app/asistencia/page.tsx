'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  MOCK_ASSIGNMENTS,
  DAYS_OF_WEEK,
  CUATRIMESTRES,
  getSubjectById,
  getGroupById,
  getStudentsByGroup,
  type MockScheduleAssignment,
} from '@/lib/mockData';

export default function AsistenciaPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

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

  // Obtener solo maestros que tengan al menos una asignación
  const teachersWithAssignments = useMemo(() => {
    const activeTeacherIds = new Set(MOCK_ASSIGNMENTS.map(a => a.teacherId));
    return teachers.filter(t => activeTeacherIds.has(t.id));
  }, [teachers]);

  // Asignaciones del maestro seleccionado
  const teacherAssignments = useMemo(() => {
    if (!selectedTeacherId) return [];
    return MOCK_ASSIGNMENTS.filter(a => a.teacherId === selectedTeacherId);
  }, [selectedTeacherId]);

  // Si cambia el maestro, reiniciar la asignación seleccionada
  useEffect(() => {
    setSelectedAssignmentId('');
  }, [selectedTeacherId]);

  // Detalles de la asignación seleccionada
  const selectedAssignment = teacherAssignments.find(a => a.id === selectedAssignmentId);
  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);
  
  // Datos relacionados a la asignación
  const subject = selectedAssignment ? getSubjectById(selectedAssignment.subjectId) : null;
  const group = selectedAssignment ? getGroupById(selectedAssignment.groupId) : null;
  const students = selectedAssignment ? getStudentsByGroup(selectedAssignment.groupId) : [];
  const cuatrimestreLabel = selectedAssignment ? CUATRIMESTRES.find(c => c.value === selectedAssignment.cuatrimestre)?.label : '';

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

              {/* Selector de Asignación (Clase) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">2. Seleccionar Clase</label>
                <select
                  value={selectedAssignmentId}
                  onChange={(e) => setSelectedAssignmentId(e.target.value)}
                  disabled={!selectedTeacherId || teacherAssignments.length === 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">-- Elija una clase --</option>
                  {teacherAssignments.map((a) => {
                    const sub = getSubjectById(a.subjectId);
                    const grp = getGroupById(a.groupId);
                    return (
                      <option key={a.id} value={a.id}>
                        {sub?.name} - {grp?.name} ({DAYS_OF_WEEK[a.scheduleDay]} {a.startTime})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Selector de Fecha y Botón Imprimir */}
              <div className="flex flex-col">
                <label className="block text-sm font-semibold text-gray-700 mb-2">3. Fecha de la Clase</label>
                <div className="flex gap-3">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    onClick={handlePrint}
                    disabled={!selectedAssignmentId}
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
        {/* DOCUMENTO IMPRIMIBLE */}
        {/* ============================================================== */}
        {selectedAssignment && selectedTeacher && subject && group && (
          <div className="bg-white rounded-lg shadow-lg p-8 print:shadow-none print:p-0">
            
            {/* Cabecera del documento */}
            <div className="border-b-2 border-gray-800 pb-4 mb-6 flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wider">Instituto Tech</h2>
                <h3 className="text-lg font-semibold text-gray-700 mt-1">Lista de Asistencia Oficial</h3>
              </div>
              <div className="text-right text-sm">
                <p><span className="font-bold">Fecha de clase:</span> {new Date(selectedDate).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><span className="font-bold">Ciclo Escolar:</span> {group.academicYear}</p>
              </div>
            </div>

            {/* Información del Maestro y la Clase */}
            <div className="grid grid-cols-2 gap-4 mb-8 text-sm border border-gray-300 rounded-lg p-4 bg-gray-50 print:bg-white print:border-gray-400">
              <div className="space-y-2">
                <p><span className="font-bold text-gray-700 w-24 inline-block">Docente:</span> <span className="uppercase">{selectedTeacher.firstName} {selectedTeacher.lastName}</span></p>
                <p><span className="font-bold text-gray-700 w-24 inline-block">E-mail:</span> {selectedTeacher.email}</p>
                <p><span className="font-bold text-gray-700 w-24 inline-block">Teléfono:</span> {selectedTeacher.phone || 'N/A'}</p>
                <p><span className="font-bold text-gray-700 w-24 inline-block">Especialidad:</span> {selectedTeacher.specialization || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <p><span className="font-bold text-gray-700 w-24 inline-block">Asignatura:</span> <span className="uppercase">{subject.name}</span></p>
                <p><span className="font-bold text-gray-700 w-24 inline-block">Programa:</span> {group.carrera} ({cuatrimestreLabel})</p>
                <p><span className="font-bold text-gray-700 w-24 inline-block">Grupo:</span> {group.name}</p>
                <p><span className="font-bold text-gray-700 w-24 inline-block">Horario:</span> {DAYS_OF_WEEK[selectedAssignment.scheduleDay]} de {selectedAssignment.startTime} a {selectedAssignment.endTime} hrs.</p>
              </div>
            </div>

            {/* Tabla de Alumnos */}
            <div className="mb-12">
              <table className="w-full text-sm border-collapse border border-gray-400">
                <thead>
                  <tr className="bg-gray-100 print:bg-gray-100">
                    <th className="border border-gray-400 px-3 py-2 w-12 text-center">No.</th>
                    <th className="border border-gray-400 px-3 py-2 w-32 text-center">Matrícula</th>
                    <th className="border border-gray-400 px-3 py-2 text-left">Nombre del Alumno</th>
                    <th className="border border-gray-400 px-3 py-2 w-24 text-center">Asistencia</th>
                    <th className="border border-gray-400 px-3 py-2 w-48 text-center">Firma del Alumno</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="border border-gray-400 px-3 py-6 text-center text-gray-500">
                        No hay alumnos registrados en este grupo.
                      </td>
                    </tr>
                  ) : (
                    students.sort((a, b) => a.lastName.localeCompare(b.lastName)).map((student, idx) => (
                      <tr key={student.id} className="print:break-inside-avoid">
                        <td className="border border-gray-400 px-3 py-3 text-center">{idx + 1}</td>
                        <td className="border border-gray-400 px-3 py-3 text-center font-mono text-xs">{student.registrationNumber}</td>
                        <td className="border border-gray-400 px-3 py-3 uppercase">
                          {student.lastName}, {student.firstName}
                        </td>
                        <td className="border border-gray-400 px-3 py-3 text-center">
                           {/* Espacio para palomear asistencia en físico */}
                           <div className="w-5 h-5 border border-gray-500 mx-auto rounded-sm print:border-black"></div>
                        </td>
                        <td className="border border-gray-400 px-3 py-3">
                           {/* Espacio en blanco para firma */}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Sección de Firma del Maestro */}
            <div className="mt-16 flex justify-center print:break-inside-avoid">
              <div className="text-center w-80">
                <div className="border-t border-black mb-2"></div>
                <p className="font-bold text-sm uppercase">{selectedTeacher.firstName} {selectedTeacher.lastName}</p>
                <p className="text-xs text-gray-600">Firma del Docente</p>
              </div>
            </div>

            {/* Footer de impresión */}
            <div className="mt-12 text-center text-[10px] text-gray-400 print:block">
              Generado por el Sistema Administrativo Escolar — {new Date().toLocaleString()}
            </div>

          </div>
        )}

        {/* Mensaje cuando no hay nada seleccionado */}
        {!selectedAssignment && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200 border-dashed print:hidden">
            <span className="text-4xl block mb-4">📋</span>
            <h3 className="text-lg font-semibold text-gray-700">No hay clase seleccionada</h3>
            <p className="text-gray-500 mt-2">
              Selecciona un maestro y una de sus clases en la parte superior para generar la lista de asistencia.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
