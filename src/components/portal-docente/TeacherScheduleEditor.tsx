'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { MOCK_SUBJECTS, MOCK_CARRERAS } from '@/lib/mockData';

interface TeacherScheduleEditorProps {
  teacherId: string;
}

interface RowData {
  id: string;
  available: boolean;
  subject: string;
  time: string;
  day: string;
}

export function TeacherScheduleEditor({ teacherId }: TeacherScheduleEditorProps) {
  const [rows, setRows] = useState<RowData[]>([]);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    // Cargar datos reales desde la API
    const loadAssignments = async () => {
      try {
        const res = await fetch(`/api/assignments?teacherId=${teacherId}`);
        const data = await res.json();
        if (data.success) {
          const teacherAssignments = data.data;
          const maxRows = Math.max(teacherAssignments.length, 3);
          const initialRows: RowData[] = [];

          for (let i = 0; i < maxRows; i++) {
            const a = teacherAssignments[i];
            initialRows.push({
              id: `row-${Date.now()}-${i}`,
              available: a?.isAvailable ?? false,
              subject: a?.subjectId || '',
              time: a && a.startTime && a.endTime ? `${a.startTime}-${a.endTime}` : '',
              day: a?.scheduleDay ? String(a.scheduleDay) : '',
            });
          }
          setRows(initialRows);
        }
      } catch (err) {
        console.error('Error al cargar horarios:', err);
      }
    };
    loadAssignments();
  }, [teacherId]);

  const handleRowChange = (index: number, field: keyof RowData, value: string | boolean) => {
    const newRows = [...rows];
    // @ts-ignore - dynamic key assignment
    newRows[index][field] = value;
    setRows(newRows);
  };

  const addRow = () => {
    setRows([...rows, {
      id: `row-${Date.now()}`,
      available: false, subject: '', time: '', day: ''
    }]);
  };

  const removeRow = (index: number) => {
    const newRows = [...rows];
    newRows.splice(index, 1);
    setRows(newRows);
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg(null);
    try {
      const newAssignments: any[] = [];
      
      const parseTime = (text: string) => {
        const timeMatch = text.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
        return {
          start: timeMatch ? timeMatch[1] : '08:00',
          end: timeMatch ? timeMatch[2] : '09:30'
        };
      };

      rows.forEach(r => {
        if (r.subject && r.time && r.day) {
          const parsed = parseTime(r.time);
          newAssignments.push({
            subjectId: r.subject,
            groupId: 'mock-g1', // Default ya que se eliminó CTM del UI
            scheduleDay: Number(r.day),
            startTime: parsed.start,
            endTime: parsed.end,
            modulo: 1, // Default
            cuatrimestre: 1, // Default
            isAvailable: r.available
          });
        }
      });

      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId,
          assignments: newAssignments
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Tus horarios y cargas se han guardado permanentemente.');
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        alert(data.error || 'Error al guardar asignaciones');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al guardar los horarios');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-[#061266]">Asignación de Horarios</h2>
          <p className="text-sm text-gray-500 mt-1">Llena la información de tus materias por módulo. Los cambios se sincronizarán con el área administrativa.</p>
        </div>
        <Button onClick={handleSave} isLoading={saving} className="bg-emerald-600 hover:bg-emerald-700">
          Guardar y Enviar
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-none">
        {/* Encabezado visible solo al imprimir */}
        <div className="hidden print:block p-4 mb-4 text-center border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Horario de Clases</h1>
          <p className="text-gray-600">Docente: {teacherId}</p>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm">
            ✅ {successMsg}
          </div>
        )}

        <div className="min-w-[1000px] print:min-w-0 print:w-full">
          <table className="w-full border-collapse text-sm print:text-xs">
            <thead>
              <tr className="bg-blue-600 text-white uppercase text-xs print:bg-gray-100 print:text-gray-800">
                <th className="p-3 border border-blue-700 print:hidden text-center w-12"> Disp. </th>
                <th className="p-3 border border-blue-700 print:border-gray-300">Asignatura</th>
                <th className="p-3 border border-blue-700 print:border-gray-300">Día de la Semana</th>
                <th className="p-3 border border-blue-700 print:border-gray-300">Horario</th>
                <th className="bg-transparent border-none print:hidden w-12"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} className="hover:bg-gray-50 group print:break-inside-avoid">
                  <td className={`p-1 border border-gray-200 text-center print:hidden ${row.available ? 'bg-emerald-100/50' : ''}`}>
                    <button 
                      onClick={() => handleRowChange(index, 'available', !row.available)}
                      className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center border transition-all ${row.available ? 'bg-emerald-500 border-emerald-600 text-white shadow-md' : 'bg-white border-gray-300 text-transparent hover:border-emerald-400'}`}
                      title="Confirmar disponibilidad"
                    >
                      ✓
                    </button>
                  </td>
                  <td className="p-1 border border-gray-200 print:border-gray-300 print:p-2">
                    <select 
                      value={row.subject} 
                      onChange={e => handleRowChange(index, 'subject', e.target.value)}
                      className="w-full p-2 bg-transparent outline-none text-xs print:appearance-none print:p-0"
                    >
                      <option value="">Selecciona...</option>
                      {MOCK_SUBJECTS.map(s => <option key={`s-${s.id}`} value={s.id}>{s.name}</option>)}
                    </select>
                  </td>
                  <td className="p-1 border border-gray-200 print:border-gray-300 print:p-2">
                    <select 
                      value={row.day} 
                      onChange={e => handleRowChange(index, 'day', e.target.value)}
                      className="w-full p-2 bg-transparent outline-none text-xs uppercase print:appearance-none print:p-0"
                    >
                      <option value="">Selecciona...</option>
                      <option value="1">LUNES</option>
                      <option value="2">MARTES</option>
                      <option value="3">MIÉRCOLES</option>
                      <option value="4">JUEVES</option>
                      <option value="5">VIERNES</option>
                      <option value="6">SÁBADO</option>
                      <option value="0">DOMINGO</option>
                    </select>
                  </td>
                  <td className="p-1 border border-gray-200 print:border-gray-300 print:p-2">
                    <input 
                      type="text" 
                      placeholder="Ej. 08:00-09:30" 
                      value={row.time}
                      onChange={e => handleRowChange(index, 'time', e.target.value)}
                      className="w-full p-2 bg-transparent outline-none text-xs uppercase print:p-0"
                    />
                  </td>
                  <td className="p-1 text-center border border-transparent print:hidden">
                    <button onClick={() => removeRow(index)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-2">
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
        </table>
        
        <div className="mt-6 flex flex-wrap items-center gap-4 justify-between print:hidden">
          <button onClick={addRow} className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
            <span className="text-lg">+</span> Agregar fila de horario
          </button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <input 
                type="file" 
                id="import-excel" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".xlsx, .xls, .csv"
                onChange={(e) => {
                  if (e.target.files?.length) {
                    setSuccessMsg('Excel importado correctamente (Simulación)');
                    setTimeout(() => setSuccessMsg(null), 3000);
                  }
                }}
              />
              <button className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-sm font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Importar Excel
              </button>
            </div>
            
            <button 
              onClick={() => {
                window.print();
              }}
              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-sm font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Exportar PDF
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
