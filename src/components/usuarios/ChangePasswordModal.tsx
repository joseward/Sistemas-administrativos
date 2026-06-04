'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Modal } from '@/components/ui';
import { MOCK_USERS, type MockUser } from '@/lib/mockData';

const PasswordSchema = z.object({
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof PasswordSchema>;

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: MockUser | null;
  onSuccess?: () => void;
}

export function ChangePasswordModal({ isOpen, onClose, user, onSuccess }: ChangePasswordModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ password: '', confirmPassword: '' });
      setSubmitSuccess(false);
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: PasswordFormData) => {
    if (!user) return;
    setSubmitting(true);

    try {
      await new Promise(res => setTimeout(res, 600)); // Simular red

      const idx = MOCK_USERS.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        MOCK_USERS[idx].password = data.password;
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 1500);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Cambiar contraseña de ${user.name}`}
      size="sm"
      footer={
        !submitSuccess && (
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSubmit(onSubmit)} isLoading={submitting}>
              Guardar Contraseña
            </Button>
          </div>
        )
      }
    >
      {submitSuccess ? (
        <div className="p-6 text-center text-green-700 bg-green-50 rounded-lg border border-green-200">
          <span className="block text-4xl mb-3">✅</span>
          La contraseña se ha actualizado correctamente. El usuario ya puede iniciar sesión.
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nueva Contraseña"
            type="password"
            placeholder="Escribe la nueva contraseña"
            {...register('password')}
            error={errors.password?.message}
          />
          
          <Input
            label="Confirmar Contraseña"
            type="password"
            placeholder="Vuelve a escribir la contraseña"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
          />
        </form>
      )}
    </Modal>
  );
}
