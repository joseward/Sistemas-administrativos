'use client';

import React, { useState, useMemo } from 'react';
import { Modal, Button, Input } from '@/components/ui';
import { Select } from '@/components/ui/Select';
import {
  MOCK_ACADEMIC_LEVELS,
  MOCK_CAREERS,
  MOCK_GROUPS,
  MOCK_SUBJECTS,
  CUATRIMESTRES,
  MOCK_BIMESTRES,
  MockGroupTemplate,
} from '@/lib/mockData';

interface TemplateCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: Omit<MockGroupTemplate, 'id'>) => void;
  initialData?: MockGroupTemplate | null;
}

export function TemplateCreatorModal({ isOpen, onClose, onSave, initialData }: TemplateCreatorModalProps) {
  const [nivelAcademico, setNivelAcademico] = useState('');
  const [carreraId, setCarreraId] = useState('');
  const [cuatrimestre, setCuatrimestre] = useState('');
  const [modulo, setModulo] = useState('');
  const [groupId, setGroupId] = useState('');
  const [turno, setTurno] = useState('');
  const [classroom, setClassroom] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  React.useEffect(() => {
    if (isOpen && initialData) {
      const group = MOCK_GROUPS.find(g => g.id === initialData.groupId);
      if (group) {
        const career = MOCK_CAREERS.find(c => c.id === group.carreraId);
        if (career) {
          setNivelAcademico(career.academicLevelId);
        }
        setCarreraId(group.carreraId);
        setCuatrimestre(group.cuatrimestre.toString());
        setGroupId(initialData.groupId);
        setModulo(initialData.modulo.toString());
        setTurno(initialData.turno || '');
        setClassroom(initialData.classroom);
        setSelectedSubjects(initialData.subjectIds);
      }
    } else if (isOpen && !initialData) {
      setNivelAcademico('');
      setCarreraId('');
      setCuatrimestre('');
      setModulo('');
      setTurno('');
      setGroupId('');
      setClassroom('');
      setSelectedSubjects([]);
    }
  }, [isOpen, initialData]);

  // Filtrar carreras por nivel
  const filteredCareers = useMemo(() => {
    return MOCK_CAREERS.filter(c => !nivelAcademico || c.academicLevelId === nivelAcademico);
  }, [nivelAcademico]);

  // Filtrar grupos por carrera y cuatrimestre
  const filteredGroups = useMemo(() => {
    return MOCK_GROUPS.filter(g => 
      (!carreraId || g.carreraId === carreraId) && 
      (!cuatrimestre || g.cuatrimestre === Number(cuatrimestre))
    );
  }, [carreraId, cuatrimestre]);

  // Materias de la carrera seleccionada
  const availableSubjects = useMemo(() => {
    if (!carreraId) return [];
    return MOCK_SUBJECTS.filter(s => 
      s.careerId === carreraId
    );
  }, [carreraId]);

  const handleToggleSubject = (subjectId: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSave = () => {
    if (!groupId || !modulo || !classroom || !turno || selectedSubjects.length === 0) {
      alert("Por favor completa todos los campos (incluyendo el Turno y Grupo Existente) y selecciona al menos una materia.");
      return;
    }
    
    onSave({
      groupId,
      modulo: Number(modulo),
      turno,
      classroom,
      subjectIds: selectedSubjects
    });

    // Reset y cerrar
    setNivelAcademico('');
    setCarreraId('');
    setCuatrimestre('');
    setModulo('');
    setTurno('');
    setGroupId('');
    setClassroom('');
    setSelectedSubjects([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Editar Plantilla de Grupo" : "Crear Plantilla de Grupo"}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Nivel Académico"
            value={nivelAcademico}
            onChange={(e) => {
              setNivelAcademico(e.target.value);
              setCarreraId('');
              setGroupId('');
              setSelectedSubjects([]);
            }}
            options={[
              { value: '', label: 'Seleccionar...' },
              ...MOCK_ACADEMIC_LEVELS.map(al => ({ value: al.id, label: al.name }))
            ]}
          />
          <Select
            label="Carrera / Programa"
            value={carreraId}
            onChange={(e) => {
              setCarreraId(e.target.value);
              setGroupId('');
              setSelectedSubjects([]);
            }}
            options={[
              { value: '', label: 'Seleccionar...' },
              ...filteredCareers.map(c => ({ value: c.id, label: c.name }))
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Cuatrimestre"
            value={cuatrimestre}
            onChange={(e) => {
              setCuatrimestre(e.target.value);
              setGroupId('');
              setSelectedSubjects([]);
            }}
            options={[
              { value: '', label: 'Seleccionar...' },
              ...CUATRIMESTRES.map(c => ({ value: c.value.toString(), label: c.label }))
            ]}
          />
          <Select
            label="Bimestre (Módulo)"
            value={modulo}
            onChange={(e) => setModulo(e.target.value)}
            options={[
              { value: '', label: 'Seleccionar...' },
              ...MOCK_BIMESTRES.map(b => ({ value: b.value.toString(), label: b.label }))
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Grupo Existente"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            options={[
              { value: '', label: 'Seleccionar...' },
              ...filteredGroups.map(g => ({ value: g.id, label: g.name }))
            ]}
          />
          <Select
            label="Turno / Horario"
            value={turno}
            onChange={(e) => setTurno(e.target.value)}
            options={[
              { value: '', label: 'Seleccionar...' },
              { value: 'Matutino', label: 'Matutino' },
              { value: 'Vespertino', label: 'Vespertino' },
              { value: 'Nocturno', label: 'Nocturno' },
              { value: 'Sabatino', label: 'Sabatino' },
              { value: 'Dominical', label: 'Dominical' },
              { value: 'En Línea', label: 'En Línea' }
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Aula"
            value={classroom}
            onChange={(e) => setClassroom(e.target.value)}
            options={[
              { value: '', label: 'Seleccionar...' },
              ...['CC1', 'CC2', 'B8', 'C4', 'B12', 'B10', 'B4', 'C11', 'B3', 'B1', 'C8', 'B9', 'B2', 'C7', 'C1', 'B11', 'B6', 'C9', 'C']
                .map(aula => ({ value: aula, label: aula }))
            ]}
          />
          <div></div>
        </div>

        {availableSubjects.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Materias del Cuatrimestre</h3>
            <p className="text-xs text-gray-500 mb-3">Selecciona las materias que se impartirán en este Módulo a este Grupo.</p>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {availableSubjects.map(subject => (
                <label key={subject.id} className="flex items-center gap-3 p-2 border rounded-md hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    checked={selectedSubjects.includes(subject.id)}
                    onChange={() => handleToggleSubject(subject.id)}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{subject.name}</span>
                    <span className="text-xs text-gray-500">{subject.code}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {availableSubjects.length === 0 && carreraId && (
          <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm">
            No hay materias registradas para esta carrera. Puede agregar materias en el Catálogo de Materias.
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!groupId || !modulo || !classroom || !turno || selectedSubjects.length === 0}>
            {initialData ? "Guardar Cambios" : "Crear Plantilla"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
