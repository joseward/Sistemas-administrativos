'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import {
  DAYS_OF_WEEK,
  getSubjectById,
  getGroupById,
} from '@/lib/mockData';

export default function ContratosPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');

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

  // Solo maestros que tienen asignaciones
  const teachersWithAssignments = useMemo(() => {
    const activeTeacherIds = new Set(assignments.map(a => a.teacherId));
    return teachers.filter(t => activeTeacherIds.has(t.id));
  }, [teachers, assignments]);

  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);

  // Filtrar asignaciones del maestro por módulo
  const assignmentsMod1 = useMemo(() => {
    if (!selectedTeacherId) return [];
    return assignments.filter(a => a.teacherId === selectedTeacherId && a.modulo === 1);
  }, [selectedTeacherId, assignments]);

  const assignmentsMod2 = useMemo(() => {
    if (!selectedTeacherId) return [];
    return assignments.filter(a => a.teacherId === selectedTeacherId && a.modulo === 2);
  }, [selectedTeacherId, assignments]);

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
              <h1 className="text-4xl font-bold text-[#061266]">📄 Contratos y Asignaciones</h1>
              <p className="text-gray-600 mt-2">
                Genera el Anexo I de Asignación por docente para el cuatrimestre.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
            <div className="flex items-end gap-6">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Seleccionar Docente</label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Elija un docente --</option>
                  {teachersWithAssignments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handlePrint}
                disabled={!selectedTeacherId}
                className="flex items-center gap-2"
              >
                🖨️ Imprimir Anexo
              </Button>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* DOCUMENTO IMPRIMIBLE (Anexo I: ASIGNACIÓN) */}
        {/* ============================================================== */}
        {selectedTeacher && (
          <div className="bg-white rounded-lg shadow-lg p-10 print:shadow-none print:p-0 font-sans text-gray-900">
            
            {/* Cabecera Central */}
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold uppercase tracking-wide">Anexo I: ASIGNACIÓN</h2>
              <h3 className="text-lg font-bold uppercase mt-1">CUATRIMESTRE MAYO - AGOSTO 2026</h3>
              <h4 className="text-lg uppercase mt-3">{selectedTeacher.firstName} {selectedTeacher.lastName}</h4>
            </div>

            {/* PRIMER MÓDULO */}
            <div className="mb-8">
              <h5 className="text-center font-bold text-sm uppercase mb-3">PRIMER MÓDULO: MAYO - JUNIO 2026</h5>
              
              <table className="w-full border-collapse border border-gray-800 text-xs mb-4">
                <tbody>
                  <tr>
                    <td className="border border-gray-800 p-2 align-top w-1/3">
                      {assignmentsMod1.length > 0 ? assignmentsMod1.map((a, i) => {
                        const subject = getSubjectById(a.subjectId);
                        return <div key={i} className="uppercase mb-1">{subject?.name}</div>;
                      }) : <div className="text-transparent">.</div>}
                    </td>
                    <td className="border border-gray-800 p-2 align-top w-1/3">
                      {assignmentsMod1.length > 0 ? assignmentsMod1.map((a, i) => (
                        <div key={i} className="uppercase mb-1">
                          {DAYS_OF_WEEK[a.scheduleDay]} DE {a.startTime} - {a.endTime}
                        </div>
                      )) : <div className="text-transparent">.</div>}
                    </td>
                    <td className="border border-gray-800 p-2 align-top w-1/3">
                      {assignmentsMod1.length > 0 ? assignmentsMod1.map((a, i) => {
                        const group = getGroupById(a.groupId);
                        return <div key={i} className="uppercase mb-1">{group?.carrera} {group?.grade}</div>;
                      }) : <div className="text-transparent">.</div>}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="grid grid-cols-2 gap-4 text-[11px] font-medium leading-tight">
                <div>
                  <p className="font-bold mb-1">FECHA DE INICIO</p>
                  <p>05, 06 Y 07 DE MAYO - ENTRE SEMANA</p>
                  <p>09 DE MAYO - SÁBADOS</p>
                  <p>10 DE MAYO - DOMINGOS</p>
                </div>
                <div className="text-right">
                  <p className="font-bold mb-1">FECHA DE TÉRMINO:</p>
                  <p>23, 24 Y 25 DE JUNIO - ENTRE SEMANA</p>
                  <p>27 DE JUNIO - SÁBADOS</p>
                  <p>28 DE JUNIO - DOMINGOS</p>
                </div>
              </div>
            </div>

            {/* SEGUNDO MÓDULO */}
            <div className="mb-12">
              <h5 className="text-center font-bold text-sm uppercase mb-3">SEGUNDO MÓDULO: JULIO - AGOSTO 2026</h5>
              
              <table className="w-full border-collapse border border-gray-800 text-xs mb-4 min-h-[80px]">
                <tbody>
                  <tr>
                    <td className="border border-gray-800 p-2 align-top w-1/3 h-24">
                      {assignmentsMod2.length > 0 ? assignmentsMod2.map((a, i) => {
                        const subject = getSubjectById(a.subjectId);
                        return <div key={i} className="uppercase mb-1">{subject?.name}</div>;
                      }) : null}
                    </td>
                    <td className="border border-gray-800 p-2 align-top w-1/3 h-24">
                      {assignmentsMod2.length > 0 ? assignmentsMod2.map((a, i) => (
                        <div key={i} className="uppercase mb-1">
                          {DAYS_OF_WEEK[a.scheduleDay]} DE {a.startTime} - {a.endTime}
                        </div>
                      )) : null}
                    </td>
                    <td className="border border-gray-800 p-2 align-top w-1/3 h-24">
                      {assignmentsMod2.length > 0 ? assignmentsMod2.map((a, i) => {
                        const group = getGroupById(a.groupId);
                        return <div key={i} className="uppercase mb-1">{group?.carrera} {group?.grade}</div>;
                      }) : null}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="grid grid-cols-2 gap-4 text-[11px] font-medium leading-tight">
                <div>
                  <p className="font-bold mb-1">FECHA DE INICIO</p>
                  <p>30 DE JUNIO, 01 Y 02 DE JULIO - ENTRE SEMANA</p>
                  <p>04 DE JULIO - SÁBADOS</p>
                  <p>05 DE JULIO - DOMINGOS</p>
                </div>
                <div className="text-right">
                  <p className="font-bold mb-1">FECHA DE TÉRMINO:</p>
                  <p>18, 19 Y 20 DE AGOSTO - ENTRE SEMANA</p>
                  <p>22 DE AGOSTO - SÁBADOS</p>
                  <p>23 DE AGOSTO - DOMINGOS</p>
                </div>
              </div>
            </div>

            {/* FIRMAS */}
            <div className="mt-20 print:mt-32">
              <div className="mb-16">
                <div className="w-72 border-b border-black mb-2"></div>
                <p className="text-[10px] font-bold text-gray-500 uppercase">COORDINADOR ACADEMICO</p>
              </div>
              <div>
                <div className="w-72 border-b border-black mb-2"></div>
                <p className="text-[10px] font-bold text-gray-500 uppercase">DOCENTE</p>
              </div>
            </div>
            
          </div>
        )}

        {!selectedTeacher && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200 border-dashed print:hidden">
            <span className="text-4xl block mb-4">📄</span>
            <h3 className="text-lg font-semibold text-gray-700">Ningún docente seleccionado</h3>
            <p className="text-gray-500 mt-2">
              Seleccione un docente de la lista superior para visualizar e imprimir su anexo de asignación (contrato).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
