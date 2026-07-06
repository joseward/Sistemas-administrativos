'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import {
  DAYS_OF_WEEK,
  getSubjectById,
  getGroupById,
} from '@/lib/mockData';

const HOURLY_RATE = 150; // $150 MXN por hora base
const WEEKS_PER_MODULE = 8; // 8 semanas por módulo aprox.

function calculateHours(start: string, end: string) {
  if (!start || !end) return 0;
  const [h1, m1] = start.split(':').map(Number);
  const [h2, m2] = end.split(':').map(Number);
  return Math.max(0, (h2 + m2 / 60) - (h1 + m1 / 60));
}

export default function ContratosPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [printMode, setPrintMode] = useState<'single' | 'all' | null>(null);

  // Estados para textos dinámicos del contrato
  const [contractConfig, setContractConfig] = useState({
    cuatrimestre: 'CUATRIMESTRE MAYO - AGOSTO 2026',
    mod1Title: 'PRIMER MÓDULO: MAYO - JUNIO 2026',
    mod1Start: '05, 06 Y 07 DE MAYO - ENTRE SEMANA\n09 DE MAYO - SÁBADOS\n10 DE MAYO - DOMINGOS',
    mod1End: '23, 24 Y 25 DE JUNIO - ENTRE SEMANA\n27 DE JUNIO - SÁBADOS\n28 DE JUNIO - DOMINGOS',
    mod2Title: 'SEGUNDO MÓDULO: JULIO - AGOSTO 2026',
    mod2Start: '30 DE JUNIO, 01 Y 02 DE JULIO - ENTRE SEMANA\n04 DE JULIO - SÁBADOS\n05 DE JULIO - DOMINGOS',
    mod2End: '18, 19 Y 20 DE AGOSTO - ENTRE SEMANA\n22 DE AGOSTO - SÁBADOS\n23 DE AGOSTO - DOMINGOS'
  });

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

  const handleConfigChange = (field: string, value: string) => {
    setContractConfig(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (printMode) {
      // Permitimos que el DOM se actualice con la vista de impresión elegida antes de invocar print
      const timer = setTimeout(() => {
        window.print();
        setPrintMode(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [printMode]);

  // Helper function to render a contract for a specific teacher
  const renderContract = (teacher: any, isLast: boolean) => {
    const teacherAssignments = assignments.filter(a => a.teacherId === teacher.id);
    const mod1 = teacherAssignments.filter(a => a.modulo === 1);
    const mod2 = teacherAssignments.filter(a => a.modulo === 2);

    return (
      <div 
        key={teacher.id} 
        className="bg-white rounded-lg shadow-lg p-10 print:shadow-none print:p-0 font-sans text-gray-900 mb-8"
        style={{ pageBreakAfter: isLast ? 'auto' : 'always' }}
      >
        
        {/* Cabecera Central */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold uppercase tracking-wide">Anexo I: ASIGNACIÓN</h2>
          <h3 className="text-lg font-bold uppercase mt-1">{contractConfig.cuatrimestre}</h3>
          <h4 className="text-lg uppercase mt-3">{teacher.firstName} {teacher.lastName}</h4>
        </div>

        {/* PRIMER MÓDULO */}
        <div className="mb-8">
          <h5 className="text-center font-bold text-sm uppercase mb-3">{contractConfig.mod1Title}</h5>
          
          <table className="w-full border-collapse border border-gray-800 text-xs mb-4">
            <tbody>
              <tr>
                <td className="border border-gray-800 p-2 align-top w-1/3">
                  {mod1.length > 0 ? mod1.map((a, i) => {
                    const subject = getSubjectById(a.subjectId);
                    return <div key={i} className="uppercase mb-1">{subject?.name}</div>;
                  }) : <div className="text-transparent">.</div>}
                </td>
                <td className="border border-gray-800 p-2 align-top w-1/3">
                  {mod1.length > 0 ? mod1.map((a, i) => (
                    <div key={i} className="uppercase mb-1">
                      {DAYS_OF_WEEK[a.scheduleDay]} DE {a.startTime} - {a.endTime}
                    </div>
                  )) : <div className="text-transparent">.</div>}
                </td>
                <td className="border border-gray-800 p-2 align-top w-1/3">
                  {mod1.length > 0 ? mod1.map((a, i) => {
                    const group = getGroupById(a.groupId);
                    return <div key={i} className="uppercase mb-1">{group?.carrera} {group?.grade}</div>;
                  }) : <div className="text-transparent">.</div>}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="grid grid-cols-2 gap-4 text-[11px] font-medium leading-tight whitespace-pre-wrap">
            <div>
              <p className="font-bold mb-1">FECHA DE INICIO</p>
              <p>{contractConfig.mod1Start}</p>
            </div>
            <div className="text-right">
              <p className="font-bold mb-1">FECHA DE TÉRMINO:</p>
              <p>{contractConfig.mod1End}</p>
            </div>
          </div>
        </div>

        {/* SEGUNDO MÓDULO */}
        <div className="mb-12">
          <h5 className="text-center font-bold text-sm uppercase mb-3">{contractConfig.mod2Title}</h5>
          
          <table className="w-full border-collapse border border-gray-800 text-xs mb-4 min-h-[80px]">
            <tbody>
              <tr>
                <td className="border border-gray-800 p-2 align-top w-1/3 h-24">
                  {mod2.length > 0 ? mod2.map((a, i) => {
                    const subject = getSubjectById(a.subjectId);
                    return <div key={i} className="uppercase mb-1">{subject?.name}</div>;
                  }) : null}
                </td>
                <td className="border border-gray-800 p-2 align-top w-1/3 h-24">
                  {mod2.length > 0 ? mod2.map((a, i) => (
                    <div key={i} className="uppercase mb-1">
                      {DAYS_OF_WEEK[a.scheduleDay]} DE {a.startTime} - {a.endTime}
                    </div>
                  )) : null}
                </td>
                <td className="border border-gray-800 p-2 align-top w-1/3 h-24">
                  {mod2.length > 0 ? mod2.map((a, i) => {
                    const group = getGroupById(a.groupId);
                    return <div key={i} className="uppercase mb-1">{group?.carrera} {group?.grade}</div>;
                  }) : null}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="grid grid-cols-2 gap-4 text-[11px] font-medium leading-tight whitespace-pre-wrap">
            <div>
              <p className="font-bold mb-1">FECHA DE INICIO</p>
              <p>{contractConfig.mod2Start}</p>
            </div>
            <div className="text-right">
              <p className="font-bold mb-1">FECHA DE TÉRMINO:</p>
              <p>{contractConfig.mod2End}</p>
            </div>
          </div>
        </div>

        {/* FIRMAS */}
        <div className="mt-20 print:mt-32">
          <div className="flex justify-between px-12">
            <div className="text-center">
              <div className="w-64 border-b border-black mb-2 mx-auto"></div>
              <p className="text-[10px] font-bold text-gray-500 uppercase">COORDINADOR ACADEMICO</p>
            </div>
            <div className="text-center">
              <div className="w-64 border-b border-black mb-2 mx-auto"></div>
              <p className="text-[10px] font-bold text-gray-500 uppercase">DOCENTE</p>
            </div>
          </div>
        </div>
        
      </div>
    );
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                >
                  <option value="">-- Elija un docente --</option>
                  {teachersWithAssignments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setPrintMode('single')}
                  disabled={!selectedTeacherId || printMode !== null}
                  className="flex items-center gap-2 h-[42px]"
                >
                  🖨️ Imprimir Actual
                </Button>
                <Button
                  onClick={() => setPrintMode('all')}
                  disabled={teachersWithAssignments.length === 0 || printMode !== null}
                  variant="outline"
                  className="flex items-center gap-2 h-[42px] border-blue-600 text-blue-700 hover:bg-blue-50"
                >
                  📑 Imprimir Todos ({teachersWithAssignments.length})
                </Button>
              </div>
            </div>
            
            {/* Controles Dinámicos del Contrato */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-bold text-gray-700 mb-4">Configuración de Fechas y Textos del Documento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="col-span-full">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Título del Cuatrimestre</label>
                  <input type="text" value={contractConfig.cuatrimestre} onChange={e => handleConfigChange('cuatrimestre', e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm uppercase" />
                </div>
                
                {/* Módulo 1 */}
                <div className="space-y-3 bg-gray-50 p-4 rounded-md">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Título Módulo 1</label>
                    <input type="text" value={contractConfig.mod1Title} onChange={e => handleConfigChange('mod1Title', e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm uppercase" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Inicio Módulo 1</label>
                    <textarea rows={3} value={contractConfig.mod1Start} onChange={e => handleConfigChange('mod1Start', e.target.value)} className="w-full px-3 py-2 border rounded-md text-xs uppercase" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Término Módulo 1</label>
                    <textarea rows={3} value={contractConfig.mod1End} onChange={e => handleConfigChange('mod1End', e.target.value)} className="w-full px-3 py-2 border rounded-md text-xs uppercase" />
                  </div>
                </div>

                {/* Módulo 2 */}
                <div className="space-y-3 bg-gray-50 p-4 rounded-md">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Título Módulo 2</label>
                    <input type="text" value={contractConfig.mod2Title} onChange={e => handleConfigChange('mod2Title', e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm uppercase" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Inicio Módulo 2</label>
                    <textarea rows={3} value={contractConfig.mod2Start} onChange={e => handleConfigChange('mod2Start', e.target.value)} className="w-full px-3 py-2 border rounded-md text-xs uppercase" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Término Módulo 2</label>
                    <textarea rows={3} value={contractConfig.mod2End} onChange={e => handleConfigChange('mod2End', e.target.value)} className="w-full px-3 py-2 border rounded-md text-xs uppercase" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* DOCUMENTO IMPRIMIBLE (Anexo I: ASIGNACIÓN) */}
        {/* ============================================================== */}
        
        {/* Vista cuando estamos imprimiendo TODOS */}
        {(printMode === 'all') && teachersWithAssignments.length > 0 && (
          <div className="mt-8">
            {teachersWithAssignments.map((t, index) => renderContract(t, index === teachersWithAssignments.length - 1))}
          </div>
        )}

        {/* Vista cuando NO estamos imprimiendo todos (Preview de uno solo, o imprimiendo uno solo) */}
        {printMode !== 'all' && selectedTeacher && (
          <div className="mt-8">
            {renderContract(selectedTeacher, true)}
          </div>
        )}

        {printMode !== 'all' && !selectedTeacher && (
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
