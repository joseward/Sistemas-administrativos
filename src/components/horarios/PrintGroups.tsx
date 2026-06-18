'use client';

import React from 'react';
import { MOCK_GROUP_TEMPLATES, MOCK_SUBJECTS, DAYS_OF_WEEK, TIME_SLOTS, getGroupById, getTeacherById } from '@/lib/mockData';

export function PrintGroups({ assignments }: { assignments: any[] }) {
  // Solo los templates que tienen asignaciones
  const activeTemplates = MOCK_GROUP_TEMPLATES.filter(tpl => 
    assignments.some(a => a.groupId === tpl.groupId && a.modulo === tpl.modulo && !a.isAvailable)
  );

  return (
    <div className="hidden print:block w-full text-black">
      {activeTemplates.map((tpl, i) => {
        const group = getGroupById(tpl.groupId);
        if (!group) return null;

        // Horarios del grupo
        const groupAssignments = assignments.filter(a => 
          a.groupId === tpl.groupId && 
          a.modulo === tpl.modulo && 
          !a.isAvailable
        );

        return (
          <div key={tpl.id} className="w-full h-screen page-break-after-always flex flex-col pt-8">
            <div className="text-center mb-8 border-b-2 border-black pb-4">
              <h1 className="text-3xl font-black uppercase mb-2">Horario de Clases</h1>
              <h2 className="text-xl font-bold">{group.carrera} - {group.name}</h2>
              <p className="text-md">Cuatrimestre {group.cuatrimestre} | Módulo {tpl.modulo}</p>
            </div>

            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border border-black p-2 bg-gray-100">Horario</th>
                  {DAYS_OF_WEEK.map((day, idx) => (
                    <th key={idx} className="border border-black p-2 bg-gray-100 uppercase">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.slice(0, 30).map(time => {
                  // Ver si hay clase en este time slot
                  let hasClassInRow = false;
                  DAYS_OF_WEEK.forEach((_, dIdx) => {
                    if (groupAssignments.some(a => a.scheduleDay === dIdx && a.startTime <= time && a.endTime > time)) {
                      hasClassInRow = true;
                    }
                  });

                  if (!hasClassInRow) return null;

                  return (
                    <tr key={time}>
                      <td className="border border-black p-2 text-center font-bold bg-gray-50">{time}</td>
                      {DAYS_OF_WEEK.map((_, dIdx) => {
                        const classHere = groupAssignments.find(a => 
                          a.scheduleDay === dIdx && a.startTime <= time && a.endTime > time
                        );
                        if (!classHere) return <td key={dIdx} className="border border-black p-2"></td>;
                        
                        const subject = MOCK_SUBJECTS.find(s => s.id === classHere.subjectId);
                        const teacher = getTeacherById(classHere.teacherId);

                        // Evitar repetir la celda si ocupa múltiples slots, o fusionarla (por simplicidad aquí repetimos o solo marcamos el inicio)
                        // Para PDF es mejor que se vea el bloque claro.
                        if (classHere.startTime !== time) return <td key={dIdx} className="border border-black p-2 text-center text-xs text-gray-500">↑</td>;

                        return (
                          <td key={dIdx} className="border border-black p-2 text-center bg-blue-50">
                            <div className="font-bold text-xs">{subject?.name}</div>
                            <div className="text-[10px] mt-1 text-gray-700">{teacher?.firstName} {teacher?.lastName}</div>
                            <div className="text-[10px] mt-1 italic">{classHere.classroom}</div>
                          </td>
                        );
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className="mt-auto mb-8 text-center text-xs text-gray-500">
              Generado automáticamente por el Sistema Administrativo Escolar
            </div>
          </div>
        )
      })}
    </div>
  )
}
