'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, LoadingSpinner, Input } from '@/components/ui';
import { cn } from '@/lib/utils';

interface AvailabilitySlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface AvailabilityGridProps {
  teacherId: string;
  isReadOnly?: boolean;
}

const DAYS_SPANISH = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const TIME_SLOTS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
];

export function AvailabilityGrid({ teacherId, isReadOnly = false }: AvailabilityGridProps) {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('12:00');

  // Cargar disponibilidad
  useEffect(() => {
    fetchAvailability();
  }, [teacherId]);

  const fetchAvailability = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/teachers/${teacherId}`);
      if (response.data.success && response.data.data.availability) {
        setAvailability(
          response.data.data.availability.map((a: any) => ({
            id: a.id,
            dayOfWeek: a.dayOfWeek,
            startTime: a.startTime,
            endTime: a.endTime,
            isAvailable: a.isAvailable,
          }))
        );
      }
    } catch (err) {
      setError('Error al cargar la disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  const handleSetAvailability = async (dayOfWeek: number) => {
    setSaving(true);
    setError(null);

    try {
      // Convertir strings de hora a objetos Date
      const startDateTime = new Date();
      startDateTime.setHours(parseInt(startTime.split(':')[0]));
      startDateTime.setMinutes(parseInt(startTime.split(':')[1]));

      const endDateTime = new Date();
      endDateTime.setHours(parseInt(endTime.split(':')[0]));
      endDateTime.setMinutes(parseInt(endTime.split(':')[1]));

      const response = await axios.post(
        `/api/teachers/${teacherId}/availability`,
        {
          dayOfWeek,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
        }
      );

      if (response.data.success) {
        await fetchAvailability();
        setEditingDay(null);
        setStartTime('08:00');
        setEndTime('12:00');
      }
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : 'Error al actualizar disponibilidad';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAvailability = async (availabilityId: string) => {
    if (!confirm('¿Eliminar esta disponibilidad?')) return;

    setSaving(true);
    try {
      const response = await axios.delete(
        `/api/teachers/${teacherId}/availability/${availabilityId}`
      );

      if (response.data.success) {
        setAvailability(availability.filter((a) => a.id !== availabilityId));
      }
    } catch (err) {
      setError('Error al eliminar disponibilidad');
    } finally {
      setSaving(false);
    }
  };

  const getAvailabilityForDay = (dayOfWeek: number) => {
    return availability.find((a) => a.dayOfWeek === dayOfWeek && a.isAvailable);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-300 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Grid de Disponibilidad */}
      <div className="space-y-3">
        {DAYS_SPANISH.map((day, dayIndex) => {
          const dayAvailability = getAvailabilityForDay(dayIndex);
          const isEditing = editingDay === dayIndex;

          return (
            <div
              key={dayIndex}
              className="border border-gray-300 rounded-lg p-4 bg-white"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{day}</h3>
                {dayAvailability && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {dayAvailability.startTime} - {dayAvailability.endTime}
                    </span>
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora Inicio
                      </label>
                      <Input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora Fin
                      </label>
                      <Input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      isLoading={saving}
                      onClick={() => handleSetAvailability(dayIndex)}
                    >
                      Guardar
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setEditingDay(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  {!isReadOnly && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingDay(dayIndex);
                          if (dayAvailability) {
                            setStartTime(dayAvailability.startTime);
                            setEndTime(dayAvailability.endTime);
                          }
                        }}
                      >
                        {dayAvailability ? 'Editar' : 'Agregar Disponibilidad'}
                      </Button>
                      {dayAvailability && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteAvailability(dayAvailability.id)}
                        >
                          Eliminar
                        </Button>
                      )}
                    </>
                  )}
                  {isReadOnly && !dayAvailability && (
                    <span className="text-sm text-gray-500">No disponible</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
        <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
        <p className="text-sm text-gray-700">
          <strong>Verde:</strong> Disponible
        </p>
      </div>
    </div>
  );
}
