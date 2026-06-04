'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Select, Modal } from '@/components/ui';
import { MOCK_USERS, type MockUser } from '@/lib/mockData';

const UserFormSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  status: z.enum(['active', 'inactive']),
});

type UserFormData = z.infer<typeof UserFormSchema>;

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editingUser?: MockUser | null;
}

export function UserForm({ isOpen, onClose, onSuccess, editingUser }: UserFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(UserFormSchema),
    defaultValues: {
      name: '',
      email: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (editingUser) {
        reset({
          name: editingUser.name,
          email: editingUser.email,
          status: editingUser.status,
        });
      } else {
        reset({
          name: '',
          email: '',
          status: 'active',
        });
      }
      setSubmitError(null);
    }
  }, [isOpen, editingUser, reset]);

  const onSubmit = async (data: UserFormData) => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      await new Promise(res => setTimeout(res, 500)); // Simular red

      if (editingUser) {
        const idx = MOCK_USERS.findIndex(u => u.id === editingUser.id);
        if (idx !== -1) {
          MOCK_USERS[idx] = { ...MOCK_USERS[idx], ...data };
        }
      } else {
        MOCK_USERS.push({
          id: `usr-admin${Date.now()}`,
          name: data.name,
          email: data.email,
          role: 'admin',
          status: data.status,
          createdAt: new Date().toISOString(),
        });
      }

      reset();
      onClose();
      onSuccess?.();
    } catch (err) {
      setSubmitError('Error al guardar el usuario');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingUser ? 'Editar Administrador' : 'Nuevo Administrador'}
      size="md"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={submitting}>
            {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
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

        <Input
          label="Nombre Completo"
          placeholder="Ej: Juan Pérez"
          {...register('name')}
          error={errors.name?.message}
        />

        <Input
          label="Correo Electrónico (Usuario)"
          type="email"
          placeholder="admin@instituto.edu"
          {...register('email')}
          error={errors.email?.message}
        />

        <Select
          label="Estado de la Cuenta"
          {...register('status')}
          error={errors.status?.message}
          options={[
            { value: 'active', label: 'Activo (Puede iniciar sesión)' },
            { value: 'inactive', label: 'Inactivo (Acceso suspendido)' },
          ]}
        />
        
        {!editingUser && (
          <p className="text-xs text-gray-500 mt-2">
            La contraseña se generará automáticamente y se enviará al correo del nuevo administrador.
          </p>
        )}
      </form>
    </Modal>
  );
}
