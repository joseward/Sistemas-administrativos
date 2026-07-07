'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '@/components/ui';
import { Select } from '@/components/ui/Select';

interface AssignmentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: any; // MockAssignment
  subjectName: string;
  teachers: any[];
  onSave: (updatedAssignment: any) => void;
}

const DAYS_OF_WEEK = [
  { value: '-1', label: 'Sin Asignar' },
  { value: '0', label: 'Lunes' },
  { value: '1', label: 'Martes' },
  { value: '2', label: 'Miércoles' },
  { value: '3', label: 'Jueves' },
  { value: '4', label: 'Viernes' },
  { value: '5', label: 'Sábado' },
  { value: '6', label: 'Domingo' }
];

export function AssignmentEditModal({ isOpen, onClose, assignment, subjectName, onSave }: AssignmentEditModalProps) {
  const [teacherId, setTeacherId] = useState('');
  const [scheduleDay, setScheduleDay] = useState('-1');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [classroom, setClassroom] = useState('');

  useEffect(() => {
    if (isOpen && assignment) {
      setTeacherId(assignment.teacherId || '');
      setScheduleDay(assignment.scheduleDay.toString());
      setStartTime(assignment.startTime || '');
      setEndTime(assignment.endTime || '');
      setClassroom(assignment.classroom || '');
    }
  }, [isOpen, assignment]);

  const handleSave = () => {
    onSave({
      ...assignment,
      teacherId: teacherId || null,
      scheduleDay: Number(scheduleDay),
      startTime,
      endTime,
      classroom
    });
    onClose();
  };

  if (!assignment) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Asignación" size="md">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Asignatura</label>
          <Input value={subjectName} disabled className="bg-gray-100" />
        </div>

        <div>
          <Select
            label="Docente"
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            options={[
              { value: '', label: 'Sin Asignar' },
              ...teachers.map((t: any) => ({ value: t.id, label: `${t.firstName} ${t.lastName}` }))
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Día de la Semana"
            value={scheduleDay}
            onChange={(e) => setScheduleDay(e.target.value)}
            options={DAYS_OF_WEEK}
          />
          <Input
            label="Aula"
            value={classroom}
            onChange={(e) => setClassroom(e.target.value)}
            placeholder="Ej. C1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Hora de Inicio"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <Input
            label="Hora de Fin"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar Cambios</Button>
        </div>
      </div>
    </Modal>
  );
}
