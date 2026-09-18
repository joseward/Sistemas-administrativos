'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import {
  DAYS_OF_WEEK,
  MOCK_BIMESTRES,
  CUATRIMESTRES,
} from '@/lib/mockData';

export default function ContratosPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [printMode, setPrintMode] = useState<'single' | 'all' | null>(null);
  const [academicYear, setAcademicYear] = useState<string>('2026-2027');
  const [savingConfig, setSavingConfig] = useState(false);

  // Textos por defecto
  const defaultCuatrimestre = '2DO CUATRIMESTRE (MAY-AGO)';
  const defaultMod1 = 'MÓDULO 1';
  const defaultMod2 = 'MÓDULO 2';

  const [contractConfig, setContractConfig] = useState({
    cuatrimestre: defaultCuatrimestre,
    mod1Title: defaultMod1,
    mod1Start: '05, 06 Y 07 DE MAYO - ENTRE SEMANA\n09 DE MAYO - SÁBADOS\n10 DE MAYO - DOMINGOS',
    mod1End: '23, 24 Y 25 DE JUNIO - ENTRE SEMANA\n27 DE JUNIO - SÁBADOS\n28 DE JUNIO - DOMINGOS',
    mod2Title: defaultMod2,
    mod2Start: '30 DE JUNIO, 01 Y 02 DE JULIO - ENTRE SEMANA\n04 DE JULIO - SÁBADOS\n05 DE JULIO - DOMINGOS',
    mod2End: '18, 19 Y 20 DE AGOSTO - ENTRE SEMANA\n22 DE AGOSTO - SÁBADOS\n23 DE AGOSTO - DOMINGOS'
  });

  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    // 1. Cargar maestros
    fetch('/api/teachers')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTeachers(data.data);
        }
      })
      .catch(err => console.error("Error fetching teachers", err));

    // 2. Cargar asignaciones
    fetch('/api/assignments')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAssignments(data.data);
        }
      })
      .catch(err => console.error("Error fetching assignments", err));

    // 3. Cargar ciclo escolar activo
    fetch('/api/academic-years')
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.data || []);
        const active = list.find((y: any) => y.isActive);
        if (active) setAcademicYear(active.value);
      })
      .catch(err => console.error("Error fetching academic years", err));

    // 4. Cargar configuración global de contrato inicial
    fetch('/api/contracts')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setContractConfig(prev => ({
            cuatrimestre: data.data.cuatrimestre || prev.cuatrimestre,
            mod1Title: data.data.mod1Title || prev.mod1Title,
            mod1Start: data.data.mod1Start || prev.mod1Start,
            mod1End: data.data.mod1End || prev.mod1End,
            mod2Title: data.data.mod2Title || prev.mod2Title,
            mod2Start: data.data.mod2Start || prev.mod2Start,
            mod2End: data.data.mod2End || prev.mod2End,
          }));
        }
      })
      .catch(console.error);
  }, []);

  // Maestros con al menos una asignación
  const teachersWithAssignments = useMemo(() => {
    const activeTeacherIds = new Set(assignments.map(a => a.teacherId));
    return teachers.filter(t => activeTeacherIds.has(t.id));
  }, [teachers, assignments]);

  // Preseleccionar automáticamente el primer maestro disponible
  useEffect(() => {
    if (!selectedTeacherId && teachersWithAssignments.length > 0) {
      setSelectedTeacherId(teachersWithAssignments[0].id);
    }
  }, [teachersWithAssignments, selectedTeacherId]);

  // Cargar configuración de contrato desde la BD al seleccionar un docente específico
  useEffect(() => {
    if (selectedTeacherId && academicYear) {
      fetch(`/api/contracts?teacherId=${selectedTeacherId}&academicYear=${academicYear}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setContractConfig(prev => ({
              cuatrimestre: data.data.cuatrimestre || prev.cuatrimestre,
              mod1Title: data.data.mod1Title || prev.mod1Title,
              mod1Start: data.data.mod1Start || prev.mod1Start,
              mod1End: data.data.mod1End || prev.mod1End,
              mod2Title: data.data.mod2Title || prev.mod2Title,
              mod2Start: data.data.mod2Start || prev.mod2Start,
              mod2End: data.data.mod2End || prev.mod2End
            }));
          }
        })
        .catch(console.error);
    }
  }, [selectedTeacherId, academicYear]);

  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);

  const handleConfigChange = (field: string, value: string) => {
    setContractConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveConfig = async (applyToAll: boolean = false) => {
    if (!selectedTeacherId && !applyToAll) {
      alert("Seleccione un docente primero.");
      return;
    }
    
    setSavingConfig(true);
    try {
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: selectedTeacherId,
          academicYear,
          applyToAll,
          ...contractConfig
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(applyToAll ? "✅ Textos y fechas guardados y aplicados a todos los maestros correctamente." : "✅ Configuración guardada para el docente actual.");
      } else {
        alert("Error al guardar: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error de red al guardar la configuración.");
    } finally {
      setSavingConfig(false);
    }
  };

  useEffect(() => {
    if (printMode) {
      const timer = setTimeout(() => {
        window.print();
        setPrintMode(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [printMode]);

  // Helper para renderizar la tabla de materias de un módulo con alineación perfecta por fila
  const renderModuleTable = (items: any[]) => {
    if (items.length === 0) {
      return (
        <table className="w-full border-collapse border border-gray-800 text-xs mb-4">
          <tbody>
            <tr>
              <td className="border border-gray-800 p-3 text-center text-gray-500 italic">
                Sin materias asignadas para este módulo
              </td>
            </tr>
          </tbody>
        </table>
      );
    }

    return (
      <table className="w-full border-collapse border border-gray-800 text-xs mb-4">
        <thead>
          <tr className="bg-gray-100 font-bold uppercase text-[11px]">
            <th className="border border-gray-800 p-2 text-left w-2/5">Asignatura</th>
            <th className="border border-gray-800 p-2 text-left w-2/5">Horario</th>
            <th className="border border-gray-800 p-2 text-left w-1/5">Grupo</th>
          </tr>
        </thead>
        <tbody>
          {items.map((a, i) => {
            const subjectName = a.subject?.name || 'MATERIA SIN NOMBRE';
            const dayText = (a.scheduleDay != null && a.scheduleDay >= 0 && DAYS_OF_WEEK[a.scheduleDay])
              ? DAYS_OF_WEEK[a.scheduleDay]
              : 'SIN DÍA';
            const timeText = (a.startTime && a.endTime)
              ? `${dayText} DE ${a.startTime} - ${a.endTime}`
              : (dayText !== 'SIN DÍA' ? `${dayText} (HORARIO PENDIENTE)` : 'HORARIO POR DEFINIR');
            const classroomText = a.classroom ? ` (AULA: ${a.classroom})` : '';
            const careerName = a.group?.career?.name || '';
            const groupName = a.group?.name || 'GRUPO DESCONOCIDO';

            return (
              <tr key={i} className="hover:bg-gray-50/50">
                <td className="border border-gray-800 p-2 align-middle font-medium uppercase">{subjectName}</td>
                <td className="border border-gray-800 p-2 align-middle uppercase">{timeText}{classroomText}</td>
                <td className="border border-gray-800 p-2 align-middle uppercase">{careerName} {groupName}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  // Helper para renderizar el Anexo I completo de un docente
  const renderContract = (teacher: any, isLast: boolean) => {
    const teacherAssignments = assignments.filter(a => a.teacherId === teacher.id);
    const mod1 = teacherAssignments.filter(a => a.modulo === 1);
    const mod2 = teacherAssignments.filter(a => a.modulo === 2);

    return (
      <div 
        key={teacher.id} 
        className="bg-white rounded-lg shadow-lg p-10 print:shadow-none print:p-0 font-sans text-gray-900 mb-8 border border-gray-200 print:border-none"
        style={{ pageBreakAfter: isLast ? 'auto' : 'always' }}
      >
        {/* Cabecera Central */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold uppercase tracking-wide">Anexo I: ASIGNACIÓN</h2>
          <h3 className="text-lg font-bold uppercase mt-1 text-gray-800">{contractConfig.cuatrimestre}</h3>
          <h4 className="text-lg font-semibold uppercase mt-3 text-blue-900">{teacher.firstName} {teacher.lastName}</h4>
        </div>

        {/* PRIMER MÓDULO */}
        <div className="mb-8">
          <h5 className="text-center font-bold text-sm uppercase mb-3 bg-gray-50 py-1 border border-gray-300">
            {contractConfig.mod1Title}
          </h5>
          
          {renderModuleTable(mod1)}

          <div className="grid grid-cols-2 gap-4 text-[11px] font-medium leading-tight whitespace-pre-wrap mt-2">
            <div>
              <p className="font-bold mb-1 text-gray-700">FECHA DE INICIO</p>
              <p className="text-gray-800">{contractConfig.mod1Start}</p>
            </div>
            <div className="text-right">
              <p className="font-bold mb-1 text-gray-700">FECHA DE TÉRMINO:</p>
              <p className="text-gray-800">{contractConfig.mod1End}</p>
            </div>
          </div>
        </div>

        {/* SEGUNDO MÓDULO */}
        <div className="mb-12">
          <h5 className="text-center font-bold text-sm uppercase mb-3 bg-gray-50 py-1 border border-gray-300">
            {contractConfig.mod2Title}
          </h5>
          
          {renderModuleTable(mod2)}

          <div className="grid grid-cols-2 gap-4 text-[11px] font-medium leading-tight whitespace-pre-wrap mt-2">
            <div>
              <p className="font-bold mb-1 text-gray-700">FECHA DE INICIO</p>
              <p className="text-gray-800">{contractConfig.mod2Start}</p>
            </div>
            <div className="text-right">
              <p className="font-bold mb-1 text-gray-700">FECHA DE TÉRMINO:</p>
              <p className="text-gray-800">{contractConfig.mod2End}</p>
            </div>
          </div>
        </div>

        {/* FIRMAS */}
        <div className="mt-16 print:mt-28">
          <div className="flex justify-between px-12">
            <div className="text-center">
              <div className="w-64 border-b border-black mb-2 mx-auto"></div>
              <p className="text-[10px] font-bold text-gray-600 uppercase">COORDINACIÓN ACADÉMICA</p>
            </div>
            <div className="text-center">
              <div className="w-64 border-b border-black mb-2 mx-auto"></div>
              <p className="text-[10px] font-bold text-gray-600 uppercase">DOCENTE</p>
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
                Genera el Anexo I de Asignación por docente para el cuatrimestre con datos de materias en vivo.
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
                      {t.firstName} {t.lastName} ({assignments.filter(a => a.teacherId === t.id).length} materias)
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setPrintMode('single')}
                  disabled={!selectedTeacherId || printMode !== null}
                  className="flex items-center gap-2 h-[42px] bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  🖨️ Imprimir Actual
                </Button>
                <Button
                  onClick={() => setPrintMode('all')}
                  disabled={teachersWithAssignments.length === 0 || printMode !== null}
                  variant="outline"
                  className="flex items-center gap-2 h-[42px] border-blue-600 text-blue-700 hover:bg-blue-50 font-semibold"
                >
                  📑 Imprimir Todos ({teachersWithAssignments.length})
                </Button>
              </div>
            </div>
            
            {/* Controles Dinámicos del Contrato */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Configuración de Fechas y Textos del Documento</h2>
                  <p className="text-xs text-gray-500">Los textos se aplican al Anexo I del docente seleccionado o a todos los maestros al dar clic en Aplicar a Todos.</p>
                </div>
                <div className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                  Ciclo Escolar: {academicYear}
                </div>
              </div>
            
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Título del Cuatrimestre</label>
                <input
                  type="text"
                  value={contractConfig.cuatrimestre}
                  onChange={(e) => handleConfigChange('cuatrimestre', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 uppercase font-semibold text-gray-800"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-4">
                {/* Módulo 1 */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Título Módulo 1</label>
                  <input
                    type="text"
                    value={contractConfig.mod1Title}
                    onChange={(e) => handleConfigChange('mod1Title', e.target.value)}
                    className="w-full px-2 py-1.5 mb-3 border border-gray-300 rounded uppercase text-sm font-medium"
                  />
                  
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Inicio Módulo 1</label>
                  <textarea
                    value={contractConfig.mod1Start}
                    onChange={(e) => handleConfigChange('mod1Start', e.target.value)}
                    className="w-full px-2 py-1.5 mb-3 border border-gray-300 rounded uppercase text-xs h-20 resize-none font-sans"
                  />
                  
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Término Módulo 1</label>
                  <textarea
                    value={contractConfig.mod1End}
                    onChange={(e) => handleConfigChange('mod1End', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded uppercase text-xs h-20 resize-none font-sans"
                  />
                </div>

                {/* Módulo 2 */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Título Módulo 2</label>
                  <input
                    type="text"
                    value={contractConfig.mod2Title}
                    onChange={(e) => handleConfigChange('mod2Title', e.target.value)}
                    className="w-full px-2 py-1.5 mb-3 border border-gray-300 rounded uppercase text-sm font-medium"
                  />
                  
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Inicio Módulo 2</label>
                  <textarea
                    value={contractConfig.mod2Start}
                    onChange={(e) => handleConfigChange('mod2Start', e.target.value)}
                    className="w-full px-2 py-1.5 mb-3 border border-gray-300 rounded uppercase text-xs h-20 resize-none font-sans"
                  />
                  
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Término Módulo 2</label>
                  <textarea
                    value={contractConfig.mod2End}
                    onChange={(e) => handleConfigChange('mod2End', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded uppercase text-xs h-20 resize-none font-sans"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  disabled={!selectedTeacherId || savingConfig}
                  onClick={() => handleSaveConfig(false)}
                  className="text-blue-700 border-blue-300 hover:bg-blue-50 font-medium"
                >
                  {savingConfig ? 'Guardando...' : 'Guardar Configuración'}
                </Button>
                <Button
                  disabled={savingConfig}
                  onClick={() => handleSaveConfig(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  {savingConfig ? 'Guardando...' : 'Aplicar a Todos los Maestros'}
                </Button>
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
              {teachersWithAssignments.length === 0 
                ? 'No hay docentes con materias asignadas actualmente. Asigna materias a los docentes en la sección de Horarios para generar sus contratos.'
                : 'Seleccione un docente de la lista superior para visualizar e imprimir su anexo de asignación (contrato).'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
