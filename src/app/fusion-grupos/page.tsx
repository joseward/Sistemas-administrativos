'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useCurriculum } from '@/context/CurriculumContext';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Link2, ArrowLeft, Sparkles, CheckCircle2, Layers } from 'lucide-react';

export default function FusionGruposPage() {
  const { groups = [], subjects = [], templates = [], refreshData = () => {}, refreshTick } = useCurriculum() || {};
  
  const [assignments, setAssignments] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedToFuse, setSelectedToFuse] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fusingSuggestionKey, setFusingSuggestionKey] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAssignments = useCallback(() => {
    fetch('/api/assignments')
      .then(res => res.json())
      .then(data => {
        setAssignments(data.data || data.assignments || (Array.isArray(data) ? data : []));
      })
      .catch(console.error);
  }, []);

  React.useEffect(() => {
    fetchAssignments();

    fetch('/api/teachers')
      .then(res => res.json())
      .then(data => {
        setTeachers(data.data || data.teachers || (Array.isArray(data) ? data : []));
      })
      .catch(console.error);
  }, [refreshTick, fetchAssignments]);

  // Generar la lista de todas las materias a partir de las plantillas de los grupos
  const allTemplateSubjects = useMemo(() => {
    const list: any[] = [];
    templates.forEach(tpl => {
      const group = groups.find(g => g.id === tpl.groupId);
      if (!group) return;

      (tpl.subjectIds || []).forEach((subjectId: string) => {
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject) return;

        // Buscar si ya tiene una asignación (para saber su estado de fusión y docente)
        const assignment = assignments.find(a => 
          a.groupId === tpl.groupId && 
          a.modulo === tpl.modulo && 
          a.subjectId === subjectId
        );

        const teacher = assignment && assignment.teacherId ? teachers.find(t => t.id === assignment.teacherId) : null;

        // Identificador único para la vista
        const uniqueId = `${tpl.groupId}_${tpl.modulo}_${subjectId}`;

        list.push({
          uniqueId,
          groupId: tpl.groupId,
          modulo: tpl.modulo,
          subjectId: subjectId,
          groupName: group.name,
          careerName: group.career?.name || group.carrera || 'Sin Carrera',
          cuatrimestre: group.cuatrimestre,
          academicYear: group.academicYear,
          subjectName: subject.name,
          assignment: assignment || null,
          fusionGroupId: assignment?.fusionGroupId || null,
          teacherId: assignment?.teacherId || null,
          teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : null
        });
      });
    });
    return list;
  }, [templates, groups, subjects, assignments, teachers]);

  // Detector Automático de Materias Candidatas a Fusión (mismo nombre normalizado + mismo módulo en 2+ grupos)
  const fusionSuggestions = useMemo(() => {
    const map = new Map<string, any[]>();
    allTemplateSubjects.forEach(item => {
      if (item.fusionGroupId) return; // Ya está fusionada
      const normName = item.subjectName.trim().toLowerCase();
      const key = `${normName}__mod_${item.modulo}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    });

    const suggestions: { key: string; subjectName: string; modulo: number; items: any[] }[] = [];
    map.forEach((items, key) => {
      const uniqueGroups = new Set(items.map(i => i.groupId));
      if (uniqueGroups.size >= 2) {
        suggestions.push({
          key,
          subjectName: items[0].subjectName,
          modulo: items[0].modulo,
          items,
        });
      }
    });

    return suggestions;
  }, [allTemplateSubjects]);

  const filteredSubjects = useMemo(() => {
    if (!searchTerm) return allTemplateSubjects;
    const lower = searchTerm.toLowerCase();
    return allTemplateSubjects.filter(item => 
      item.subjectName.toLowerCase().includes(lower) || 
      item.groupName.toLowerCase().includes(lower) || 
      item.careerName.toLowerCase().includes(lower) ||
      (item.teacherName && item.teacherName.toLowerCase().includes(lower))
    );
  }, [allTemplateSubjects, searchTerm]);

  const handleToggleSelect = (uniqueId: string) => {
    setSelectedToFuse(prev => 
      prev.includes(uniqueId) 
        ? prev.filter(id => id !== uniqueId) 
        : [...prev, uniqueId]
    );
  };

  // Fusión en 1 clic desde sugerencia automática
  const handleQuickFuse = async (suggestionKey: string, items: any[]) => {
    setFusingSuggestionKey(suggestionKey);
    const itemsToFuse = items.map(item => ({
      groupId: item.groupId,
      modulo: item.modulo,
      subjectId: item.subjectId,
      academicYear: item.academicYear,
      cuatrimestre: item.cuatrimestre
    }));

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
        fetchAssignments();
        refreshData();
      }
    } catch (error) {
      console.error(error);
      alert('Error inesperado al fusionar.');
    } finally {
      setFusingSuggestionKey(null);
    }
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
        setSelectedToFuse([]);
        fetchAssignments();
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
        fetchAssignments();
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
        
        {/* Botón de regreso */}
        <Link href="/" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Regresar al inicio
        </Link>

        <div>
          <h1 className="text-3xl font-extrabold text-[#061266] mb-2 tracking-tight flex items-center gap-3">
            <Link2 className="w-8 h-8 text-orange-500" />
            Fusión de Grupos
          </h1>
          <p className="text-gray-600">
            Une materias de diferentes carreras o grupos para que compartan el mismo maestro, aula y horario de forma sincronizada.
          </p>
        </div>

        {/* SUGERENCIAS AUTOMÁTICAS DE FUSIÓN */}
        <div className="bg-gradient-to-r from-indigo-50/90 via-white to-orange-50/60 p-6 rounded-2xl shadow-sm border border-indigo-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Sugerencias Automáticas de Fusión ({fusionSuggestions.length})
                </h2>
                <p className="text-xs text-gray-500">
                  Detectamos materias con el mismo nombre y módulo en diferentes grupos que puedes fusionar con 1 solo clic.
                </p>
              </div>
            </div>
          </div>

          {fusionSuggestions.length === 0 ? (
            <div className="bg-white/80 rounded-xl p-4 border border-gray-100 flex items-center gap-3 text-sm text-gray-600">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>No hay materias repetidas pendientes de fusionar entre grupos en este momento.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fusionSuggestions.map(suggestion => {
                const isFusingThis = fusingSuggestionKey === suggestion.key;
                return (
                  <div
                    key={suggestion.key}
                    className="bg-white rounded-xl p-4 border border-indigo-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-bold text-gray-900 text-sm">
                          {suggestion.subjectName}
                        </span>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                          Módulo {suggestion.modulo}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestion.items.map(item => (
                          <span
                            key={item.uniqueId}
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-gray-50 text-gray-700 border border-gray-200 font-medium"
                          >
                            <Layers className="w-3 h-3 text-blue-600" />
                            <strong className="text-blue-700">{item.groupName}</strong>
                            <span className="text-gray-400">({item.careerName})</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-400">
                        {suggestion.items.length} grupos coinciden
                      </span>
                      <button
                        onClick={() => handleQuickFuse(suggestion.key, suggestion.items)}
                        disabled={isFusingThis}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        {isFusingThis ? 'Fusionando...' : `Fusionar (${suggestion.items.length} grupos)`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800">Todas las Materias de Plantillas</h2>
            <div className="flex items-center gap-4 flex-wrap">
              <input 
                type="text" 
                placeholder="Buscar por materia, carrera, grupo o maestro..."
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
                  <th className="px-5 py-3 font-semibold">Docente</th>
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
                      <td className="px-5 py-3 text-gray-600 uppercase">
                        {item.teacherName ? (
                          <span className="font-semibold text-gray-800">{item.teacherName}</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-600 border border-amber-200">Pendiente</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {isFused ? (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-orange-100 text-orange-800 text-xs font-semibold w-fit">
                              <Link2 className="w-3.5 h-3.5 text-orange-600" />
                              Fusionada
                            </span>
                            <button 
                              onClick={() => handleUnfuse(item.fusionGroupId)}
                              className="text-[10px] text-gray-400 hover:text-red-500 transition-colors underline w-fit text-left"
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
                    <td colSpan={6} className="px-5 py-8 text-center text-gray-500">
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
