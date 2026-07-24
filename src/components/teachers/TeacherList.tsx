'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import { Button, Badge, LoadingSpinner, Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import { MOCK_TEACHERS, MOCK_USERS } from '@/lib/mockData';

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialization?: string;
  contractStatus: 'active' | 'inactive' | 'pending';
  createdAt: string;
  createdByUser?: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface TeacherListProps {
  schoolId: string;
  onEdit?: (teacher: Teacher) => void;
  onDelete?: (teacherId: string) => void;
}

export function TeacherList({ schoolId, onEdit, onDelete }: TeacherListProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [availability, setAvailability] = useState<any[]>([]);

  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');

  // Cargar maestros
  useEffect(() => {
    fetchTeachers();
  }, [currentPage]);

  // Si hay filtro de disponibilidad, cargamos la disponibilidad
  useEffect(() => {
    if (filterParam === 'missing_availability') {
      fetch('/api/availability')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setAvailability(data.data);
          }
        })
        .catch(console.error);
    }
  }, [filterParam]);

  const fetchTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/teachers', {
        params: {
          page: currentPage,
          limit: 10,
        },
      });

      if (response.data.success) {
        setTeachers(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      // Si la API falla (no hay BD), usar datos simulados compartidos
      console.warn('API no disponible, usando datos simulados');
      setTeachers(MOCK_TEACHERS as Teacher[]);
      setPagination({
        page: 1,
        limit: 10,
        total: MOCK_TEACHERS.length,
        pages: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (teacherId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este maestro?')) {
      return;
    }

    setDeleting(teacherId);
    try {
      const response = await fetch(`/api/teachers/${teacherId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al eliminar');
      }
      
      setTeachers(teachers.filter((t) => t.id !== teacherId));
      if (onDelete) onDelete(teacherId);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el maestro');
    } finally {
      setDeleting(null);
    }
  };

  // Filtrar maestros por búsqueda
  const filteredTeachers = teachers.filter((teacher) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      teacher.firstName.toLowerCase().includes(searchLower) ||
      teacher.lastName.toLowerCase().includes(searchLower) ||
      teacher.email.toLowerCase().includes(searchLower) ||
      (teacher.specialization?.toLowerCase().includes(searchLower) ?? false)
    );

    if (!matchesSearch) return false;

    // Filtro adicional desde URL
    if (filterParam === 'missing_availability') {
      if (teacher.contractStatus !== 'active') return false;
      const hasAvailability = availability.some(a => a.teacherId === teacher.id);
      if (hasAvailability) return false;
    }

    return true;
  });

  const getStatusBadge = (status: 'active' | 'inactive' | 'pending') => {
    const variants = {
      active: 'success',
      inactive: 'danger',
      pending: 'warning',
    } as const;

    const labels = {
      active: '✓ Activo',
      inactive: '✕ Inactivo',
      pending: '⊙ Pendiente',
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  if (loading && teachers.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda y título de filtro */}
      <div className="w-full">
        <Input
          placeholder="Buscar por nombre, email o especialidad..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full"
        />
        {filterParam === 'missing_availability' && (
          <div className="mt-4 p-3 bg-amber-50 text-amber-800 border-l-4 border-amber-500 font-medium text-sm flex justify-between items-center shadow-sm">
            <span>⚠️ Mostrando únicamente maestros activos que NO han enviado su disponibilidad.</span>
            <a href="/maestros" className="text-amber-700 hover:text-amber-900 underline">Quitar filtro</a>
          </div>
        )}
      </div>

      {/* Mensajes de error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-300 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Tabla de maestros */}
      <div className="overflow-x-auto border border-gray-300 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Nombre
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Email
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Especialidad
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Teléfono
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">
                Estado
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">
                Registro
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">
                Creado por
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                  {searchTerm
                    ? 'No hay maestros que coincidan con tu búsqueda'
                    : 'No hay maestros registrados'}
                </td>
              </tr>
            ) : (
              filteredTeachers.map((teacher) => (
                <tr
                  key={teacher.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {teacher.firstName} {teacher.lastName}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{teacher.email}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {teacher.specialization || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {teacher.phone || '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getStatusBadge(teacher.contractStatus)}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">
                    {new Date(teacher.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    {teacher.createdByUser 
                      ? `${teacher.createdByUser.firstName || ''} ${teacher.createdByUser.lastName || ''}`.trim() || 'Admin'
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit?.(teacher)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        isLoading={deleting === teacher.id}
                        onClick={() => handleDelete(teacher.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-600">
            Mostrando {filteredTeachers.length} de {pagination.total} maestros
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              ← Anterior
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      'w-8 h-8 rounded border transition-colors',
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === pagination.pages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Siguiente →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
