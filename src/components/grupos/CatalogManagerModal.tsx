'use client';

import React, { useState } from 'react';
import { Modal, Button, Input } from '@/components/ui';
import {
  CUATRIMESTRES,
  MOCK_CARRERAS,
  MOCK_BIMESTRES,
  MOCK_YEARS,
  MOCK_SUBJECTS,
  MOCK_GROUPS
} from '@/lib/mockData';

interface CatalogManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CatalogManagerModal({ isOpen, onClose, onSuccess }: CatalogManagerModalProps) {
  const [activeTab, setActiveTab] = useState<'carreras' | 'materias' | 'cuatrimestres' | 'bimestres' | 'años'>('carreras');
  
  // Estados para nuevos items y edición
  const [newValue, setNewValue] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = () => {
    if (!newValue.trim()) return;

    if (activeTab === 'carreras') {
      MOCK_CARRERAS.push(newValue.trim());
    } else if (activeTab === 'años') {
      MOCK_YEARS.push(newValue.trim());
    } else if (activeTab === 'bimestres') {
      MOCK_BIMESTRES.push({ value: MOCK_BIMESTRES.length + 1, label: newValue.trim() });
    } else if (activeTab === 'cuatrimestres') {
      CUATRIMESTRES.push({ value: CUATRIMESTRES.length + 1, label: newValue.trim() });
    } else if (activeTab === 'materias') {
      MOCK_SUBJECTS.push({ id: `mock-s${Date.now()}`, name: newValue.trim(), code: `MAT-${Date.now()}`.substring(0,8) });
    }
    
    setNewValue('');
    onSuccess();
  };

  const handleSaveEdit = (index: number) => {
    if (!editValue.trim()) return;

    if (activeTab === 'carreras') {
      const oldName = MOCK_CARRERAS[index];
      const newName = editValue.trim();
      MOCK_CARRERAS[index] = newName;
      // Cascade update to groups
      MOCK_GROUPS.forEach(g => {
        if (g.carrera === oldName) g.carrera = newName;
      });
    } else if (activeTab === 'años') {
      MOCK_YEARS[index] = editValue.trim();
    } else if (activeTab === 'bimestres') {
      MOCK_BIMESTRES[index].label = editValue.trim();
    } else if (activeTab === 'cuatrimestres') {
      CUATRIMESTRES[index].label = editValue.trim();
    } else if (activeTab === 'materias') {
      MOCK_SUBJECTS[index].name = editValue.trim();
    }
    
    setEditingIndex(null);
    setEditValue('');
    onSuccess();
  };

  const handleRemove = (index: number) => {
    if (!confirm('¿Seguro que quieres eliminar este elemento?')) return;
    
    if (activeTab === 'carreras') {
      MOCK_CARRERAS.splice(index, 1);
    } else if (activeTab === 'años') {
      MOCK_YEARS.splice(index, 1);
    } else if (activeTab === 'bimestres') {
      MOCK_BIMESTRES.splice(index, 1);
    } else if (activeTab === 'cuatrimestres') {
      CUATRIMESTRES.splice(index, 1);
    } else if (activeTab === 'materias') {
      MOCK_SUBJECTS.splice(index, 1);
    }
    onSuccess();
  };

  const renderList = () => {
    let items: any[] = [];
    if (activeTab === 'carreras') items = MOCK_CARRERAS;
    if (activeTab === 'años') items = MOCK_YEARS;
    if (activeTab === 'bimestres') items = MOCK_BIMESTRES.map(b => b.label);
    if (activeTab === 'cuatrimestres') items = CUATRIMESTRES.map(c => c.label);
    if (activeTab === 'materias') items = MOCK_SUBJECTS.map(s => s.name);

    return (
      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 border rounded text-sm">
            {editingIndex === index ? (
              <div className="flex items-center gap-2 flex-1 mr-2">
                <Input 
                  value={editValue} 
                  onChange={(e) => setEditValue(e.target.value)} 
                  className="flex-1 h-8"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(index)}
                  autoFocus
                />
                <button onClick={() => handleSaveEdit(index)} className="text-green-600 font-bold hover:text-green-800">✓</button>
                <button onClick={() => setEditingIndex(null)} className="text-gray-500 font-bold hover:text-gray-700">✕</button>
              </div>
            ) : (
              <>
                <span>{item}</span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => { setEditingIndex(index); setEditValue(item); }}
                    className="text-blue-500 hover:text-blue-700 px-2 font-bold"
                    title="Editar"
                  >
                    ✎
                  </button>
                  <button 
                    onClick={() => handleRemove(index)}
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
          <p className="text-gray-500 text-center py-4 text-sm">No hay elementos registrados.</p>
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
          {['carreras', 'materias', 'cuatrimestres', 'bimestres', 'años'].map((tab) => (
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

        {/* Lista */}
        <div className="mt-4">
          {renderList()}
        </div>

        {/* Agregar Nuevo */}
        <div className="flex gap-2 pt-4 border-t mt-4">
          <Input
            placeholder={`Nuevo(a) ${activeTab.slice(0, -1)}...`}
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
