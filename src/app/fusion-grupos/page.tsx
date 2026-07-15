'use client';

import React, { useState, useMemo } from 'react';
import { useCurriculum } from '@/context/CurriculumContext';
import { Button } from '@/components/ui/Button';

export default function FusionGruposPage() {
  const { templates = [], groups = [], subjects = [], assignments = [], refreshData = () => {} } = useCurriculum() || {};
  
  const [selectedToFuse, setSelectedToFuse] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Generar la lista de todas las materias de todas las plantillas
  const allTemplateSubjects = useMemo(() => {
    const list: any[] = [];
    templates.forEach(tpl => {
      const group = groups.find(g => g.id === tpl.groupId);
      if (!group) return;

      tpl.subjectIds.forEach(subId => {
        const subject = subjects.find(s => s.id === subId);
        if (!subject) return;

        const assignment = assignments.find(a => 
          a.groupId === tpl.groupId && 
          a.modulo === tpl.modulo && 
          a.subjectId === subId
        );

        // Identificador único para la vista
        const uniqueId = `${tpl.groupId}-${tpl.modulo}-${subId}`;

        list.push({
          uniqueId,
          groupId: tpl.groupId,
          modulo: tpl.modulo,
          subjectId: subId,
          groupName: group.name,
          careerName: group.career?.name || 'Sin Carrera',
          cuatrimestre: group.cuatrimestre,
          academicYear: group.academicYear,
          subjectName: subject.name,
          assignment: assignment,
          fusionGroupId: assignment?.fusionGroupId || null
        });
      });
    });
    return list;
  }, [templates, groups, subjects, assignments]);

  const filteredSubjects = useMemo(() => {
    if (!searchTerm) return allTemplateSubjects;
    const lower = searchTerm.toLowerCase();
    return allTemplateSubjects.filter(item => 
      item.subjectName.toLowerCase().includes(lower) || 
      item.groupName.toLowerCase().includes(lower) || 
      item.careerName.toLowerCase().includes(lower)
    );
  }, [allTemplateSubjects, searchTerm]);

  const handleToggleSelect = (uniqueId: string) => {
    setSelectedToFuse(prev => 
      prev.includes(uniqueId) 
        ? prev.filter(id => id !== uniqueId) 
        : [...prev, uniqueId]
    );
  };

  const handleFuse = async () => {
    if (selectedToFuse.length < 2) {
      alert('Debes seleccionar al menos 2 materias para fusionar.');
      return;
    }

    if (!confirm(`¿Estás seguro de fusionar estas ${selectedToFuse.length} materias? Compartirán el mismo maestro, horario y aula.`)) {
      return;
    }

    setIsSubmitting(true);
    
    // Preparar el payload
    const itemsToFuse = selectedToFuse.map(id => {
      const item = allTemplateSubjects.find(s => s.uniqueId === id);
      return {
        groupId: item.groupId,
        modulo: item.modulo,
        subjectId: item.subjectId,
        academicYear: item.academicYear,
        cuatrimestre: item.cuatrimestre
      };
    });

    try {
      const res = await fetch('/api/fusion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToFuse })
      });
      const data = await res.json();
      
      if (data.error) {
        alert('Error al fusionar: ' + data.error);
      } else {
        alert('¡Fusión completada con éxito!');
        setSelectedToFuse([]);
        refreshData();
      }
    } catch (error) {
      console.error(error);
      alert('Error inesperado al fusionar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnfuse = async (fusionGroupId: string) => {
    if (!confirm('¿Estás seguro de separar estas materias? Dejarán de compartir el mismo maestro y horario.')) {
      return;
    }
    
    try {
      const res = await fetch('/api/fusion', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fusionGroupId })
      });
      const data = await res.json();
      
      if (data.error) {
        alert('Error al separar: ' + data.error);
      } else {
        refreshData();
      }
    } catch (error) {
      console.error(error);
      alert('Error inesperado al separar.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#061266] mb-2 tracking-tight">🔗 Fusión de Grupos</h1>
          <p className="text-gray-600">
            Une materias de diferentes carreras o grupos para que compartan el mismo maestro, aula y horario de forma sincronizada.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Materias Disponibles para Fusionar</h2>
            <div className="flex items-center gap-4">
              <input 
                type="text" 
                placeholder="Buscar por materia, carrera o grupo..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="px-4 py-2 border rounded-lg text-sm w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button 
                onClick={handleFuse} 
                disabled={selectedToFuse.length < 2 || isSubmitting}
                className="bg-[#f97316] hover:bg-orange-600 text-white"
              >
                {isSubmitting ? 'Fusionando...' : `Fusionar Seleccionadas (${selectedToFuse.length})`}
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 font-semibold w-10"></th>
                  <th className="px-5 py-3 font-semibold">Asignatura</th>
                  <th className="px-5 py-3 font-semibold">Carrera</th>
                  <th className="px-5 py-3 font-semibold">Grupo</th>
                  <th className="px-5 py-3 font-semibold">Estado de Fusión</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.map(item => {
                  const isSelected = selectedToFuse.includes(item.uniqueId);
                  const isFused = !!item.fusionGroupId;

                  return (
                    <tr 
                      key={item.uniqueId} 
                      className={`border-b border-gray-50 transition-colors ${isSelected ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-5 py-3 text-center">
                        <input 
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item.uniqueId)}
                          className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-5 py-3 font-medium text-gray-900">
                        {item.subjectName}
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {item.careerName}
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-semibold text-blue-600">{item.groupName}</span>
                        <span className="text-xs text-gray-500 ml-2">(Cuatri {item.cuatrimestre}, Mód {item.modulo})</span>
                      </td>
                      <td className="px-5 py-3">
                        {isFused ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-orange-100 text-orange-800 text-xs font-semibold">
                              🔗 Fusionada
                            </span>
                            <button 
                              onClick={() => handleUnfuse(item.fusionGroupId)}
                              className="text-xs text-gray-400 hover:text-red-500 transition-colors underline"
                            >
                              Separar
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Independiente</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredSubjects.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                      No se encontraron materias que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
