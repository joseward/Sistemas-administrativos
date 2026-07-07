'use client';

import React, { useState } from 'react';
import { Modal, Button, Input } from '@/components/ui';
import { Select } from '@/components/ui/Select';
} from '@/lib/mockData';
import { useCurriculum } from '@/context/CurriculumContext';

interface CatalogManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CatalogManagerModal({ isOpen, onClose, onSuccess }: CatalogManagerModalProps) {
  const [activeTab, setActiveTab] = useState<'carreras' | 'materias' | 'cuatrimestres' | 'bimestres' | 'años' | 'grupos'>('carreras');
  
  const [selectedCarreraId, setSelectedCarreraId] = useState('');
  const [selectedCuatri, setSelectedCuatri] = useState('');

  // Estados para nuevos items y edición
  const [newValue, setNewValue] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  
  const { careers = [], subjects = [], groups = [], academicYears = [], bimestres = [], cuatrimestres = [], refreshData = () => {} } = useCurriculum() || {};

  const handleAdd = async () => {
    if (!newValue.trim()) return;

    try {
      if (activeTab === 'carreras') {
        await fetch('/api/careers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newValue.trim() })
        });
      } else if (activeTab === 'años') {
        await fetch('/api/academic-years', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: newValue.trim() })
        });
      } else if (activeTab === 'bimestres') {
        await fetch('/api/bimestres', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: bimestres.length + 1, label: newValue.trim() })
        });
      } else if (activeTab === 'cuatrimestres') {
        await fetch('/api/cuatrimestres', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: cuatrimestres.length + 1, label: newValue.trim() })
        });
      } else if (activeTab === 'materias') {
        alert("Para agregar materias, se requiere un módulo de administración de base de datos.");
      } else if (activeTab === 'grupos') {
        if (!selectedCarreraId || !selectedCuatri) { alert('Selecciona una carrera y cuatrimestre para el grupo'); return; }
        await fetch('/api/groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newValue.trim(),
            careerId: selectedCarreraId,
            cuatrimestre: Number(selectedCuatri),
            section: 'A',
            modality: 'SMART',
          })
        });
      }
      
      refreshData();
      setNewValue('');
      onSuccess();
    } catch (err) {
      console.error(err);
      alert('Error al guardar');
    }
  };

  const handleSaveEdit = (originalIndex: number) => {
    alert("Edición deshabilitada. Si deseas cambiar el nombre, elimina el elemento y vuelve a crearlo. Esto es para proteger la consistencia de los datos históricos.");
    setEditingIndex(null);
    setEditValue('');
  };

  const handleRemove = async (originalIndex: number) => {
    if (!confirm('¿Seguro que quieres eliminar este elemento?')) return;
    
    let url = '';
    
    if (activeTab === 'carreras') {
      url = `/api/careers?id=${careers[originalIndex]?.id}`;
    } else if (activeTab === 'años') {
      url = `/api/academic-years?id=${academicYears[originalIndex]?.id}`;
    } else if (activeTab === 'bimestres') {
      url = `/api/bimestres?id=${bimestres[originalIndex]?.id}`;
    } else if (activeTab === 'cuatrimestres') {
      url = `/api/cuatrimestres?id=${cuatrimestres[originalIndex]?.id}`;
    } else if (activeTab === 'materias') {
      alert("Eliminación de materias deshabilitada en esta vista.");
      return;
    } else if (activeTab === 'grupos') {
      url = `/api/groups?id=${groups[originalIndex]?.id}`;
    }

    if (url && !url.includes('undefined')) {
      try {
        await fetch(url, { method: 'DELETE' });
        refreshData();
        onSuccess();
      } catch (e) {
        alert('Error al eliminar');
      }
    }
  };

  const renderList = () => {
    let items: { display: string, originalIndex: number }[] = [];
    
    if (activeTab === 'carreras') items = careers.map((c: any, i: number) => ({ display: c.name, originalIndex: i }));
    if (activeTab === 'años') items = academicYears.map((y: any, i: number) => ({ display: y.value, originalIndex: i }));
    if (activeTab === 'bimestres') items = bimestres.map((b: any, i: number) => ({ display: b.label, originalIndex: i }));
    if (activeTab === 'cuatrimestres') items = cuatrimestres.map((c: any, i: number) => ({ display: c.label, originalIndex: i }));
    
    if (activeTab === 'materias') {
      subjects.forEach((s: any, i: number) => {
         if (!selectedCarreraId || s.careerId === selectedCarreraId) items.push({ display: s.name, originalIndex: i });
      });
    }
    if (activeTab === 'grupos') {
      groups.forEach((g: any, i: number) => {
         if ((!selectedCarreraId || g.careerId === selectedCarreraId) && (!selectedCuatri || g.cuatrimestre.toString() === selectedCuatri)) {
            items.push({ display: g.name, originalIndex: i });
         }
      });
    }

    return (
      <div className="space-y-2 max-h-60 overflow-y-auto pr-2 mt-4">
        {items.map((item) => (
          <div key={item.originalIndex} className="flex items-center justify-between p-2 bg-gray-50 border rounded text-sm">
            {editingIndex === item.originalIndex ? (
              <div className="flex items-center gap-2 flex-1 mr-2">
                <Input 
                  value={editValue} 
                  onChange={(e) => setEditValue(e.target.value)} 
                  className="flex-1 h-8"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(item.originalIndex)}
                  autoFocus
                />
                <button onClick={() => handleSaveEdit(item.originalIndex)} className="text-green-600 font-bold hover:text-green-800">✓</button>
                <button onClick={() => setEditingIndex(null)} className="text-gray-500 font-bold hover:text-gray-700">✕</button>
              </div>
            ) : (
              <>
                <span>{item.display}</span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => { setEditingIndex(item.originalIndex); setEditValue(item.display); }}
                    className="text-blue-500 hover:text-blue-700 px-2 font-bold"
                    title="Editar"
                  >
                    ✎
                  </button>
                  <button 
                    onClick={() => handleRemove(item.originalIndex)}
                    className="text-red-500 hover:text-red-700 px-2 font-bold"
                    title="Eliminar"
                  >
                    ×
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-gray-500 text-center py-4 text-sm">No hay elementos registrados para esta selección.</p>
        )}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestión de Catálogos"
      size="md"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Agrega o elimina opciones de los filtros. Los cambios se reflejarán en todo el sistema.
        </p>

        {/* Tabs */}
        <div className="flex gap-2 border-b pb-2 overflow-x-auto">
          {['carreras', 'materias', 'grupos', 'cuatrimestres', 'bimestres', 'años'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab as any); setEditingIndex(null); }}
              className={`px-3 py-1 text-sm font-medium rounded-t-lg transition-colors capitalize whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-[#061266] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filtros para Materias y Grupos */}
        {(activeTab === 'materias' || activeTab === 'grupos') && (
          <div className="grid grid-cols-2 gap-2 mt-4 bg-gray-50 p-3 rounded-lg border">
            <Select
              label="Filtrar por Carrera"
              value={selectedCarreraId}
              onChange={(e) => setSelectedCarreraId(e.target.value)}
              options={[
                { value: '', label: 'Todas las Carreras' },
                ...careers.map((c: any) => ({ value: c.id, label: c.name }))
              ]}
            />
            {activeTab === 'grupos' && (
              <Select
                label="Filtrar por Cuatrimestre"
                value={selectedCuatri}
                onChange={(e) => setSelectedCuatri(e.target.value)}
                options={[
                  { value: '', label: 'Seleccionar...' },
                  ...cuatrimestres.map((c: any) => ({ value: c.value.toString(), label: c.label }))
                ]}
              />
            )}
          </div>
        )}

        {/* Lista */}
        <div>
          {renderList()}
        </div>

        {/* Agregar Nuevo */}
        <div className="flex gap-2 pt-4 border-t mt-4">
          <Input
            placeholder={activeTab === 'grupos' ? 'Nuevo grupo (Ej. ISC 8)' : `Nuevo(a) ${activeTab.slice(0, -1)}...`}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1"
          />
          <Button onClick={handleAdd}>Agregar</Button>
        </div>
      </div>
    </Modal>
  );
}
