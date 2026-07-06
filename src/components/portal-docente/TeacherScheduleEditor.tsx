'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { TIME_SLOTS } from '@/lib/mockData';

interface TeacherScheduleEditorProps {
  teacherId: string;
}

interface RowData {
  id: string;
  startTime: string;
  endTime: string;
  day: string;
}

export function TeacherScheduleEditor({ teacherId }: TeacherScheduleEditorProps) {
  const [rows, setRows] = useState<RowData[]>([]);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Cargar datos reales desde la API
    const loadAvailability = async () => {
      try {
        const res = await fetch(`/api/availability?teacherId=${teacherId}`);
        const data = await res.json();
        if (data.success) {
          const teacherAvailability = data.data;
          const maxRows = Math.max(teacherAvailability.length, 3);
          const initialRows: RowData[] = [];

          for (let i = 0; i < maxRows; i++) {
            const a = teacherAvailability[i];
            initialRows.push({
              id: `row-${Date.now()}-${i}`,
              startTime: a?.startTime || '',
              endTime: a?.endTime || '',
              day: a?.dayOfWeek !== undefined ? String(a.dayOfWeek) : '',
            });
          }
          setRows(initialRows);
        }
      } catch (err) {
        console.error('Error al cargar disponibilidad:', err);
      }
    };
    loadAvailability();
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
      startTime: '', endTime: '', day: ''
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
    setErrorMsg(null);

    const newAvailability: any[] = [];
    let hasError = false;
    let filledRowsCount = 0;
    const validRows: RowData[] = [];
    
    const dayNames = ["DOMINGO", "LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"];
    
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const isPartiallyFilled = r.startTime || r.endTime || r.day;
      const isCompletelyFilled = r.startTime && r.endTime && r.day;

      if (isCompletelyFilled) {
        if (r.startTime >= r.endTime) {
          setErrorMsg(`Error en fila ${i + 1}: La hora de inicio debe ser anterior a la hora de fin.`);
          hasError = true;
          break;
        }
        
        // Verificar traslapes con filas anteriores
        const overlaps = validRows.some(vr => 
          vr.day === r.day && 
          r.startTime < vr.endTime && 
          vr.startTime < r.endTime
        );

        if (overlaps) {
          setErrorMsg(`Error: Hay un traslape de horario en tus filas del día ${dayNames[Number(r.day)]}. Verifica que no se empalmen las horas.`);
          hasError = true;
          break;
        }

        validRows.push(r);
        filledRowsCount++;
        newAvailability.push({
          dayOfWeek: Number(r.day),
          startTime: r.startTime,
          endTime: r.endTime
        });
      } else if (isPartiallyFilled) {
        setErrorMsg(`Error en fila ${i + 1}: Debes completar todos los campos del horario libre (Día y Horas).`);
        hasError = true;
        break;
      }
    }

    if (hasError) {
      setSaving(false);
      return;
    }

    if (filledRowsCount === 0) {
      setErrorMsg('Debes llenar al menos un horario de clase antes de enviar.');
      setSaving(false);
      return;
    }

    try {

      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId,
          availability: newAvailability
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
          <h2 className="text-2xl font-bold text-[#061266]">Disponibilidad de Horario</h2>
          <p className="text-sm text-gray-500 mt-1">Llena la información con los días y horas que tienes disponibles. El área administrativa usará esto para asignarte grupos.</p>
        </div>
        <Button onClick={handleSave} isLoading={saving} className="bg-emerald-600 hover:bg-emerald-700">
          Guardar y Enviar
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-none">
        {/* Encabezado visible solo al imprimir */}
        <div className="hidden print:block p-4 mb-4 text-center border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Disponibilidad de Horarios</h1>
          <p className="text-gray-600">Docente: {teacherId}</p>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium">
            ✅ {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium">
            ⚠️ {errorMsg}
          </div>
        )}

        <div className="min-w-[1000px] print:min-w-0 print:w-full">
          <table className="w-full border-collapse text-sm print:text-xs">
            <thead>
              <tr className="bg-blue-600 text-white uppercase text-xs print:bg-gray-100 print:text-gray-800">
                <th className="p-3 border border-blue-700 print:border-gray-300 w-1/3">Día de la Semana</th>
                <th className="p-3 border border-blue-700 print:border-gray-300 w-2/3">Horas Libres (Inicio - Fin)</th>
                <th className="bg-transparent border-none print:hidden w-12"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} className="hover:bg-gray-50 group print:break-inside-avoid">
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
                  <td className="p-1 border border-gray-200 print:border-gray-300 print:p-2 min-w-[200px]">
                    <div className="flex items-center gap-1">
                      <select
                        value={row.startTime}
                        onChange={e => handleRowChange(index, 'startTime', e.target.value)}
                        className="w-full p-2 bg-transparent outline-none text-xs print:appearance-none print:p-0"
                      >
                        <option value="">Inicio...</option>
                        {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <span className="text-gray-400 font-bold">-</span>
                      <select
                        value={row.endTime}
                        onChange={e => handleRowChange(index, 'endTime', e.target.value)}
                        className="w-full p-2 bg-transparent outline-none text-xs print:appearance-none print:p-0"
                      >
                        <option value="">Fin...</option>
                        {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
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
