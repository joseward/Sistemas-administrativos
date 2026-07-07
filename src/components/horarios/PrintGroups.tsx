'use client';

import React from 'react';
import { MOCK_GROUP_TEMPLATES, DAYS_OF_WEEK, getGroupById } from '@/lib/mockData';

export function PrintGroups({ assignments, teachers, subjects, isCapturing }: { assignments: any[], teachers: any[], subjects: any[], isCapturing?: boolean }) {
  // Solo los templates que tienen asignaciones en el arreglo actual (filtrado)
  const activeGroups = Array.from(new Set(assignments.map(a => a.groupId)));

  return (
    <div 
      id="print-container" 
      className={`text-black bg-white ${isCapturing ? 'block absolute top-0 left-0 z-[-1] w-[700px]' : 'hidden print:block w-full'}`}
    >
      {activeGroups.map((groupId) => {
        const group = getGroupById(groupId);
        if (!group) return null;

        const groupAssignments = assignments.filter(a => a.groupId === groupId && !a.isAvailable);
        if (groupAssignments.length === 0) return null;

        // Group by day
        const byDay: Record<number, any[]> = {};
        groupAssignments.forEach(a => {
          if (!byDay[a.scheduleDay]) byDay[a.scheduleDay] = [];
          byDay[a.scheduleDay].push(a);
        });

        return (
          <div key={groupId} className="max-w-[700px] mx-auto page-break-after-always flex flex-col pt-8 bg-white p-6">
            <div className="text-center mb-6 border-b-2 border-black pb-4">
               <h1 className="text-2xl font-black uppercase mb-1">HORARIO DE CLASES (ALUMNOS)</h1>
               <h2 className="text-lg font-bold">{group.carrera}</h2>
               <p className="text-md">Cuatrimestre {group.cuatrimestre}</p>
            </div>
            
            {Object.keys(byDay).sort().map((dayStr) => {
              const dayNum = parseInt(dayStr);
              const dayAssignments = byDay[dayNum].sort((a, b) => a.startTime.localeCompare(b.startTime));

              return (
                <div key={dayNum} className="mb-8">
                  <table className="w-full border-collapse text-sm mb-4">
                    <thead>
                      <tr>
                        <th colSpan={2} className="border border-black p-2 bg-[#C5B4E3] text-left text-base">{group.name}</th>
                        <th colSpan={2} className="border border-black p-2 bg-[#C5B4E3] text-left text-base uppercase">{DAYS_OF_WEEK[dayNum]}</th>
                      </tr>
                      <tr>
                        <th className="border border-black p-2 bg-gray-100 uppercase text-center w-[40%]">Asignatura</th>
                        <th className="border border-black p-2 bg-gray-100 uppercase text-center w-[25%]">Docente</th>
                        <th className="border border-black p-2 bg-gray-100 uppercase text-center w-[20%]">Horario</th>
                        <th className="border border-black p-2 bg-gray-100 uppercase text-center w-[15%]">Aula</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayAssignments.map((a, index) => {
                        const subject = subjects.find((s: any) => s.id === a.subjectId);
                        const teacher = teachers.find(t => t.id === a.teacherId);
                        return (
                          <tr key={index}>
                            <td className="border border-black p-2">{subject?.name}</td>
                            <td className="border border-black p-2 text-center">{teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Pendiente'}</td>
                            <td className="border border-black p-2 text-center">{a.startTime} - {a.endTime}</td>
                            <td className="border border-black p-2 text-center font-bold">{a.classroom || '---'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
            <div className="mt-auto mb-8 text-center text-xs text-gray-500">
              Generado automáticamente por el Sistema Administrativo Escolar
            </div>
          </div>
        );
      })}
    </div>
  );
}
