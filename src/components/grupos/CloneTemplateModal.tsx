'use client';

import React, { useState } from 'react';
import { Modal, Button } from '@/components/ui';
import { Select } from '@/components/ui/Select';
import { Copy, ArrowRight, Building2, Clock } from 'lucide-react';

interface CloneTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceTemplate: any | null;
  sourceGroup: any | null;
  allGroups: any[];
  classrooms: any[];
  onCloneSuccess: () => void;
}

export function CloneTemplateModal({
  isOpen,
  onClose,
  sourceTemplate,
  sourceGroup,
  allGroups,
  classrooms,
  onCloneSuccess
}: CloneTemplateModalProps) {
  const [targetGroupId, setTargetGroupId] = useState('');
  const [turno, setTurno] = useState(sourceTemplate?.turno || 'Sabatino');
  const [classroom, setClassroom] = useState(sourceTemplate?.classroom || '');
  const [loading, setLoading] = useState(false);

  // Inicializar valores cuando se abre
  React.useEffect(() => {
    if (sourceTemplate) {
      setTurno(sourceTemplate.turno || 'Sabatino');
      setClassroom(sourceTemplate.classroom || '');
      setTargetGroupId('');
    }
  }, [sourceTemplate]);

  // Filtrar grupos destino: que no sean el grupo de origen
  const eligibleGroups = allGroups.filter(g => 
    g.id !== sourceGroup?.id && 
    (!sourceGroup?.careerId || g.careerId === sourceGroup.careerId)
  );

  const handleClone = async () => {
    if (!sourceTemplate || !targetGroupId) {
      alert('Por favor selecciona el grupo de destino.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/templates/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceTemplateId: sourceTemplate.id,
          targetGroupId,
          modulo: sourceTemplate.modulo,
          turno,
          classroom
        })
      });

      const data = await res.json();
      if (data.success) {
        onCloneSuccess();
        onClose();
      } else {
        alert('Error al clonar la plantilla: ' + (data.error || 'Desconocido'));
      }
    } catch (err) {
      console.error('Error cloning template:', err);
      alert('Error de conexión al clonar plantilla.');
    } finally {
      setLoading(false);
    }
  };

  if (!sourceTemplate || !sourceGroup) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Clonar Plantilla a Otro Grupo">
      <div className="space-y-5">
        {/* Origen */}
        <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block mb-1">
            Plantilla de Origen (A copiar)
          </span>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-gray-900 text-sm">
                Grupo {sourceGroup.name} · Módulo {sourceTemplate.modulo}
              </h4>
              <p className="text-xs text-gray-600 mt-0.5">
                {sourceTemplate.subjectIds?.length || 0} materia(s) en la plantilla
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-white text-blue-900 rounded-lg border border-blue-200">
              {sourceTemplate.turno || 'Sin Turno'}
            </span>
          </div>
        </div>

        <div className="flex justify-center -my-2 text-gray-400">
          <ArrowRight className="w-5 h-5 rotate-90" />
        </div>

        {/* Destino */}
        <div className="space-y-4">
          <Select
            label="Grupo de Destino *"
            value={targetGroupId}
            onChange={(e) => setTargetGroupId(e.target.value)}
            options={[
              { value: '', label: '-- Seleccionar Grupo Destino --' },
              ...eligibleGroups.map(g => ({
                value: g.id,
                label: `Grupo ${g.name} (${g.career?.name || 'Carrera'} · Cuatri ${g.cuatrimestre})`
              }))
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Turno para el nuevo grupo"
              value={turno}
              onChange={(e) => setTurno(e.target.value)}
              options={[
                { value: 'Matutino', label: 'Matutino' },
                { value: 'Vespertino', label: 'Vespertino' },
                { value: 'Nocturno', label: 'Nocturno' },
                { value: 'Sabatino', label: 'Sabatino' },
                { value: 'Dominical', label: 'Dominical' },
                { value: 'En Línea', label: 'En Línea' }
              ]}
            />

            <Select
              label="Aula asignada"
              value={classroom}
              onChange={(e) => setClassroom(e.target.value)}
              options={[
                { value: '', label: 'Seleccionar Aula...' },
                ...classrooms.map(c => ({ value: c.name, label: c.name }))
              ]}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleClone} 
            disabled={!targetGroupId || loading}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            {loading ? 'Clonando...' : 'Copiar Materias a este Grupo'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
