'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Select } from '@/components/ui';
import { MOCK_TEACHERS, type MockTeacher } from '@/lib/mockData';

const ProfileSchema = z.object({
  firstName: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'Apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional().or(z.literal('')),
  specialization: z.string().optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof ProfileSchema>;

interface TeacherProfileEditorProps {
  teacherId: string;
}

export function TeacherProfileEditor({ teacherId }: TeacherProfileEditorProps) {
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const teacher = MOCK_TEACHERS.find(t => t.id === teacherId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialization: '',
    },
  });

  useEffect(() => {
    if (teacher) {
      reset({
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        phone: teacher.phone || '',
        specialization: teacher.specialization || '',
      });
    }
  }, [teacher, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setSubmitting(true);
    setSuccessMsg(null);
    try {
      await new Promise(res => setTimeout(res, 600)); // Simular red
      const index = MOCK_TEACHERS.findIndex(t => t.id === teacherId);
      if (index !== -1) {
        MOCK_TEACHERS[index] = { 
          ...MOCK_TEACHERS[index], 
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          specialization: data.specialization
        };
        setSuccessMsg('Información actualizada correctamente.');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!teacher) return <div className="p-6 text-gray-500">Docente no encontrado.</div>;

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-[#061266] mb-6">Información Personal</h2>
      
      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm">
          ✅ {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre(s)"
            {...register('firstName')}
            error={errors.firstName?.message}
          />
          <Input
            label="Apellidos"
            {...register('lastName')}
            error={errors.lastName?.message}
          />
        </div>

        <Input
          label="Correo Electrónico Institucional"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          disabled
        />
        <p className="text-xs text-gray-500 -mt-3 mb-4 ml-1">El correo electrónico debe cambiarse desde administración.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Teléfono de Contacto"
            {...register('phone')}
            error={errors.phone?.message}
          />
          <Input
            label="Especialidad / Perfil Profesional"
            {...register('specialization')}
            error={errors.specialization?.message}
          />
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" isLoading={submitting} className="bg-emerald-600 hover:bg-emerald-700">
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  );
}
