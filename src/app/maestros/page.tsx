'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { TeacherList, TeacherForm, AvailabilityGrid } from '@/components/teachers';
import { Modal, Button, Input, LoadingSpinner } from '@/components/ui';

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  cedula?: string;
  specialization?: string;
  contractStatus: 'active' | 'inactive' | 'pending';
}

export default function TeachersPage() {
  // Para este ejemplo, usamos un schoolId hardcodeado
  // En producción, esto vendría de un contexto o sesión de usuario
  const SCHOOL_ID = 'clu2oj0lp0000gxvs7f7f7f7f';

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showAvailability, setShowAvailability] = useState(false);
  const [refreshList, setRefreshList] = useState(0);

  const handleOpenForm = (teacher?: Teacher) => {
    if (teacher) {
      setEditingTeacher(teacher);
    } else {
      setEditingTeacher(null);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTeacher(null);
  };

  const handleFormSuccess = () => {
    setRefreshList((prev) => prev + 1);
  };

  const handleEdit = (teacher: Teacher) => {
    handleOpenForm(teacher);
  };

  const handleDelete = (teacherId: string) => {
    setRefreshList((prev) => prev + 1);
  };

  const handleOpenAvailability = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowAvailability(true);
  };

  return (
    <div className="min-h-screen bg-transparent p-6">
      <div className="max-w-7xl mx-auto">
        {/* Botón Regresar */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-6 transition-colors group"
        >
          <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
          Regresar al inicio
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#061266]">Gestión de Maestros</h1>
            <p className="text-gray-600 mt-2">
              Administra los maestros de la institución, sus horarios y contratos
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => handleOpenForm()}
            className="shadow-lg"
          >
            + Nuevo Maestro
          </Button>
        </div>

        {/* Tabs/Sections */}
        <div className="space-y-8">
          {/* Sección: Listado de Maestros */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Maestros Registrados
            </h2>
            <Suspense fallback={<LoadingSpinner />}>
              <TeacherList
                key={refreshList}
                schoolId={SCHOOL_ID}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </Suspense>
          </div>

          {/* Sección: Gestión de Disponibilidad */}
          {selectedTeacher && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Disponibilidad Horaria
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {selectedTeacher.firstName} {selectedTeacher.lastName}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelectedTeacher(null);
                    setShowAvailability(false);
                  }}
                >
                  ✕ Cerrar
                </Button>
              </div>
              <AvailabilityGrid teacherId={selectedTeacher.id} />
            </div>
          )}
        </div>
      </div>

      {/* Modal: Formulario de Maestro */}
      <TeacherForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
        schoolId={SCHOOL_ID}
        editingTeacher={editingTeacher}
      />

      {/* Modal: Gestión Rápida de Disponibilidad */}
      <Modal
        isOpen={showAvailability && selectedTeacher !== null}
        onClose={() => setShowAvailability(false)}
        title={`Disponibilidad: ${selectedTeacher?.firstName} ${selectedTeacher?.lastName}`}
        size="lg"
      >
        {selectedTeacher && <AvailabilityGrid teacherId={selectedTeacher.id} />}
      </Modal>
    </div>
  );
}
