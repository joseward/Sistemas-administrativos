'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Modal } from '@/components/ui';

const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

const PasswordFormSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string()
    .min(8, 'Debe tener al menos 8 caracteres')
    .regex(passwordRegex, 'Debe incluir al menos una letra mayúscula y un número'),
  confirmPassword: z.string().min(1, 'Debes confirmar la nueva contraseña'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas nuevas no coinciden",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof PasswordFormSchema>;

export function ChangePasswordForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(PasswordFormSchema),
  });

  const onSubmit = async (data: PasswordFormData) => {
    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const response = await fetch('/api/users/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al cambiar la contraseña');
      }

      setSuccessMsg('Contraseña actualizada exitosamente.');
      reset();
      setTimeout(() => {
        setIsOpen(false);
        setSuccessMsg('');
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error desconocido');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button variant="secondary" onClick={() => setIsOpen(true)} className="print:hidden">
        🔐 Cambiar Contraseña
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          reset();
          setSuccessMsg('');
          setErrorMsg('');
        }}
        title="Cambiar Contraseña"
        size="md"
      >
        <div className="p-2">
          <p className="text-gray-600 mb-6 text-sm">
            Para mantener tu cuenta segura, elige una contraseña de al menos 8 caracteres que incluya una letra mayúscula y un número.
          </p>

          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm">
              ✅ {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
              ❌ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Contraseña Actual"
              type="password"
              {...register('currentPassword')}
              error={errors.currentPassword?.message}
            />

            <Input
              label="Nueva Contraseña"
              type="password"
              {...register('newPassword')}
              error={errors.newPassword?.message}
            />
            <p className="text-xs text-gray-500 -mt-2">Mínimo 8 caracteres, 1 mayúscula, 1 número.</p>

            <Input
              label="Confirmar Nueva Contraseña"
              type="password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />

            <div className="pt-4 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" isLoading={submitting}>
                Actualizar Contraseña
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
