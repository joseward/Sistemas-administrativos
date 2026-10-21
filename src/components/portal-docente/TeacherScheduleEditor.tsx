'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { TIME_SLOTS, DAYS_OF_WEEK } from '@/lib/mockData';
import { ChangePasswordForm } from './ChangePasswordForm';
import { CheckCircle2, AlertCircle, Trash2, Plus, Clock, Printer } from 'lucide-react';

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
    const loadAvailability = async () => {
      try {
        const res = await fetch(`/api/availability?teacherId=${teacherId}`);
        const data = await res.json();
        if (data.success) {
          const teacherAvailability = data.data || [];
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

  const handleRowChange = (index: number, field: keyof RowData, value: string) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const addRow = () => {
    setRows([
      ...rows,
      {
        id: `row-${Date.now()}`,
        startTime: '',
        endTime: '',
        day: '',
      },
    ]);
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) {
      setRows([{ id: `row-${Date.now()}`, startTime: '', endTime: '', day: '' }]);
      return;
    }
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

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const isPartiallyFilled = r.startTime || r.endTime || r.day !== '';
      const isCompletelyFilled = r.startTime && r.endTime && r.day !== '';

      if (isCompletelyFilled) {
        if (r.startTime >= r.endTime) {
          setErrorMsg(
            `Error en fila ${i + 1}: La hora de inicio debe ser anterior a la hora de fin.`
          );
          hasError = true;
          break;
        }

        const overlaps = validRows.some(
          vr =>
            vr.day === r.day && r.startTime < vr.endTime && vr.startTime < r.endTime
        );

        if (overlaps) {
          const dayLabel = DAYS_OF_WEEK[Number(r.day)] || 'seleccionado';
          setErrorMsg(
            `Error: Hay un traslape de horario en tus filas del día ${dayLabel}. Verifica que no se empalmen las horas.`
          );
          hasError = true;
          break;
        }

        validRows.push(r);
        filledRowsCount++;
        newAvailability.push({
          dayOfWeek: Number(r.day),
          startTime: r.startTime,
          endTime: r.endTime,
        });
      } else if (isPartiallyFilled) {
        setErrorMsg(
          `Error en fila ${i + 1}: Debes completar todos los campos del horario libre (Día, Inicio y Fin).`
        );
        hasError = true;
        break;
      }
    }

    if (hasError) {
      setSaving(false);
      return;
    }

    if (filledRowsCount === 0) {
      setErrorMsg('Debes llenar al menos un bloque de horario disponible antes de guardar.');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId,
          availability: newAvailability,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(
          'Tu disponibilidad se ha enviado correctamente a Coordinación Académica.'
        );
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        setErrorMsg(data.error || 'Error al guardar tu disponibilidad.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Error de conexión al guardar los horarios.');
    } finally {
      setSaving(false);
    }
  };

  const completedBlocks = rows.filter(r => r.day !== '' && r.startTime && r.endTime).length;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 pb-5 border-b border-gray-100 print:hidden">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-[#061266]">Disponibilidad de Horario</h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {completedBlocks} {completedBlocks === 1 ? 'bloque listo' : 'bloques listos'}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Indica los días y rangos de horas en que puedes impartir clases. Coordinación recibirá esta información en tiempo real.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <ChangePasswordForm />
          <Button
            onClick={handleSave}
            isLoading={saving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Guardar y Enviar
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="mb-5 p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-5 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#061266] text-white uppercase text-xs tracking-wider">
              <th className="p-3.5 text-left w-[38%]">Día de la Semana</th>
              <th className="p-3.5 text-left w-[52%]">Horas Libres (Inicio — Fin)</th>
              <th className="p-3.5 text-center w-[10%] print:hidden">Quitar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((row, index) => (
              <tr key={row.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="p-2.5">
                  <select
                    value={row.day}
                    onChange={e => handleRowChange(index, 'day', e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-xs font-semibold text-gray-800 uppercase cursor-pointer"
                  >
                    <option value="">Selecciona un día...</option>
                    {DAYS_OF_WEEK.map((dayName, dayIdx) => (
                      <option key={dayIdx} value={String(dayIdx)}>
                        {dayName.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2.5">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <select
                        value={row.startTime}
                        onChange={e => handleRowChange(index, 'startTime', e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-xs font-mono font-semibold text-gray-800 cursor-pointer"
                      >
                        <option value="">Hora inicio...</option>
                        {TIME_SLOTS.map(t => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <span className="text-gray-400 font-bold text-xs">a</span>
                    <div className="relative flex-1">
                      <select
                        value={row.endTime}
                        onChange={e => handleRowChange(index, 'endTime', e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-xs font-mono font-semibold text-gray-800 cursor-pointer"
                      >
                        <option value="">Hora fin...</option>
                        {TIME_SLOTS.map(t => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </td>
                <td className="p-2.5 text-center print:hidden">
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg p-2 transition-colors cursor-pointer"
                    title="Eliminar fila"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4 justify-between print:hidden">
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-bold px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Agregar otro día / horario
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Imprimir Comprobante
        </button>
      </div>
    </div>
  );
}
