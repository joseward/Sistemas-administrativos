'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Select, Modal } from '@/components/ui';
import { MOCK_TEACHERS, MOCK_SUBJECTS, MOCK_USERS } from '@/lib/mockData';

// Esquema de validación
const TeacherFormSchema = z.object({
  firstName: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'Apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional().or(z.literal('')),
  cedula: z.string().optional().or(z.literal('')),
  specialization: z.string().optional().or(z.literal('')),
  contractStatus: z.enum(['active', 'inactive', 'pending']),
});

type TeacherFormData = z.infer<typeof TeacherFormSchema>;

interface TeacherFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  schoolId: string;
  editingTeacher?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    cedula?: string;
    specialization?: string;
    contractStatus: 'active' | 'inactive' | 'pending';
  } | null;
}

export function TeacherForm({
  isOpen,
  onClose,
  onSuccess,
  schoolId,
  editingTeacher,
}: TeacherFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TeacherFormData>({
    resolver: zodResolver(TeacherFormSchema),
    defaultValues: editingTeacher
      ? {
          firstName: editingTeacher.firstName,
          lastName: editingTeacher.lastName,
          email: editingTeacher.email,
          phone: editingTeacher.phone || '',
          cedula: editingTeacher.cedula || '',
          specialization: editingTeacher.specialization || '',
          contractStatus: editingTeacher.contractStatus,
        }
      : {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          cedula: '',
          specialization: '',
          contractStatus: 'pending',
        },
  });

  // Reset form cuando se abre/cierra o cambia editingTeacher
  useEffect(() => {
    if (isOpen) {
      if (editingTeacher) {
        reset({
          firstName: editingTeacher.firstName,
          lastName: editingTeacher.lastName,
          email: editingTeacher.email,
          phone: editingTeacher.phone || '',
          cedula: editingTeacher.cedula || '',
          specialization: editingTeacher.specialization || '',
          contractStatus: editingTeacher.contractStatus,
        });
      } else {
        reset({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          cedula: '',
          specialization: '',
          contractStatus: 'pending',
        });
      }
      setSubmitError(null);
    }
  }, [isOpen, editingTeacher, reset]);

  const onSubmit = async (data: TeacherFormData) => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      // Simular tiempo de red
      await new Promise(resolve => setTimeout(resolve, 500));

      if (editingTeacher) {
        // Actualizar maestro en memoria
        const index = MOCK_TEACHERS.findIndex(t => t.id === editingTeacher.id);
        if (index !== -1) {
          MOCK_TEACHERS[index] = { ...MOCK_TEACHERS[index], ...data };
        }
        
        // Sincronizar actualización con el usuario vinculado
        const userIndex = MOCK_USERS.findIndex(u => u.teacherId === editingTeacher.id);
        if (userIndex !== -1) {
          MOCK_USERS[userIndex].name = `${data.firstName} ${data.lastName}`;
          MOCK_USERS[userIndex].email = data.email;
          MOCK_USERS[userIndex].status = data.contractStatus === 'inactive' ? 'inactive' : 'active';
        }
      } else {
        // Crear maestro en memoria
        const newTeacherId = `mock-t${Date.now()}`;
        const newTeacher: any = {
          id: newTeacherId,
          ...data,
          createdAt: new Date().toISOString(),
        };
        MOCK_TEACHERS.push(newTeacher);
        
        // Crear automáticamente la cuenta de usuario para este maestro
        MOCK_USERS.push({
          id: `usr-doc${Date.now()}`,
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          role: 'docente',
          teacherId: newTeacherId,
          status: data.contractStatus === 'inactive' ? 'inactive' : 'active',
          createdAt: new Date().toISOString(),
        });
      }
      
      reset();
      onClose();
      onSuccess?.();
    } catch (err) {
      setSubmitError('Error al guardar el maestro');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTeacher ? 'Editar Maestro' : 'Crear Nuevo Maestro'}
      size="md"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button isLoading={submitting} onClick={handleSubmit(onSubmit)}>
            {editingTeacher ? 'Actualizar' : 'Crear'} Maestro
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {submitError && (
          <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm">
            {submitError}
          </div>
        )}

        {/* Nombre */}
        <Input
          label="Nombre *"
          placeholder="Ej: Juan"
          {...register('firstName')}
          error={errors.firstName?.message}
        />

        {/* Apellido */}
        <Input
          label="Apellido *"
          placeholder="Ej: Pérez García"
          {...register('lastName')}
          error={errors.lastName?.message}
        />

        {/* Email */}
        <Input
          label="Email *"
          type="email"
          placeholder="Ej: juan.perez@escuela.edu"
          {...register('email')}
          error={errors.email?.message}
        />

        {/* Teléfono */}
        <Input
          label="Teléfono"
          placeholder="Ej: +506-8765-4321"
          {...register('phone')}
          error={errors.phone?.message}
        />

        {/* Cédula */}
        <Input
          label="Cédula"
          placeholder="Ej: 1-2345-6789"
          {...register('cedula')}
          error={errors.cedula?.message}
        />

        {/* Especialidad */}
        <Select
          label="Especialidad (Opcional)"
          {...register('specialization')}
          error={errors.specialization?.message}
          options={[
            { value: '', label: '-- Selecciona una materia / especialidad --' },
            ...MOCK_SUBJECTS.map(s => ({ value: s.name, label: s.name }))
          ]}
        />

        {/* Estado del Contrato */}
        <Select
          label="Estado del Contrato *"
          {...register('contractStatus')}
          error={errors.contractStatus?.message}
          options={[
            { value: 'active', label: 'Activo' },
            { value: 'pending', label: 'Pendiente' },
            { value: 'inactive', label: 'Inactivo' },
          ]}
        />
      </form>
    </Modal>
  );
}
