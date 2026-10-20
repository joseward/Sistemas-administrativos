'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import { Button, Badge, LoadingSpinner, Input, Modal } from '@/components/ui';
import {
  AlertCircle,
  MessageCircle,
  CheckCircle2,
  Edit3,
  RotateCcw,
  Check,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_TEACHERS } from '@/lib/mockData';

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
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

const STORAGE_KEY_AVAIL_TEMPLATE = 'aztlan_whatsapp_avail_template';

const DEFAULT_AVAIL_TEMPLATE = `Hola Prof. {nombre}, le saludamos cordialmente de coordinación académica para recordarle registrar su disponibilidad de horario en el Portal Docente ({link}) para la asignación de sus clases. ¡Muchas gracias!`;

export function TeacherList({ schoolId, onEdit, onDelete }: TeacherListProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [availability, setAvailability] = useState<any[]>([]);

  // Estado del modal de WhatsApp editable
  const [whatsAppTarget, setWhatsAppTarget] = useState<Teacher | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [baseTemplate, setBaseTemplate] = useState(DEFAULT_AVAIL_TEMPLATE);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [templateSaved, setTemplateSaved] = useState(false);

  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');

  // Cargar maestros
  useEffect(() => {
    fetchTeachers();
  }, [currentPage]);

  // Cargar disponibilidad para mostrar estado y permitir recordatorios rápidos
  useEffect(() => {
    fetch('/api/availability')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setAvailability(data.data);
        }
      })
      .catch(console.error);
  }, []);

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

      setTeachers(teachers.filter(t => t.id !== teacherId));
      if (onDelete) onDelete(teacherId);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el maestro');
    } finally {
      setDeleting(null);
    }
  };

  const buildMessageFromTemplate = (tpl: string, teacher: Teacher) => {
    const portalUrl =
      typeof window !== 'undefined' ? `${window.location.origin}/portal-docente` : '';
    const fullName = `${teacher.firstName} ${teacher.lastName}`.trim();

    return tpl
      .replace(/\{nombre\}/g, fullName)
      .replace(/\{correo\}/g, teacher.email || '')
      .replace(/\{link\}/g, portalUrl);
  };

  const openWhatsAppPreview = (teacher: Teacher) => {
    const savedTpl =
      (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY_AVAIL_TEMPLATE)) ||
      DEFAULT_AVAIL_TEMPLATE;
    setBaseTemplate(savedTpl);
    setCustomMessage(buildMessageFromTemplate(savedTpl, teacher));
    setIsEditingTemplate(false);
    setWhatsAppTarget(teacher);
  };

  const handleSaveDefaultTemplate = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_AVAIL_TEMPLATE, baseTemplate);
    }
    if (whatsAppTarget) {
      setCustomMessage(buildMessageFromTemplate(baseTemplate, whatsAppTarget));
    }
    setTemplateSaved(true);
    setTimeout(() => setTemplateSaved(false), 2500);
    setIsEditingTemplate(false);
  };

  const handleResetDefaultTemplate = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_AVAIL_TEMPLATE);
    }
    setBaseTemplate(DEFAULT_AVAIL_TEMPLATE);
    if (whatsAppTarget) {
      setCustomMessage(buildMessageFromTemplate(DEFAULT_AVAIL_TEMPLATE, whatsAppTarget));
    }
  };

  const handleSendWhatsApp = () => {
    if (!whatsAppTarget) return;
    const cleanPhone = (whatsAppTarget.phone || '').replace(/\D/g, '');
    const encodedMsg = encodeURIComponent(customMessage);
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone.length === 10 ? '52' + cleanPhone : cleanPhone}?text=${encodedMsg}`
      : `https://api.whatsapp.com/send?text=${encodedMsg}`;

    window.open(url, '_blank', 'noopener,noreferrer');
    setWhatsAppTarget(null);
  };

  // Filtrar maestros por búsqueda
  const filteredTeachers = teachers.filter(teacher => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      teacher.firstName.toLowerCase().includes(searchLower) ||
      teacher.lastName.toLowerCase().includes(searchLower) ||
      teacher.email.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    // Filtro adicional desde URL
    if (filterParam === 'missing_availability') {
      if (teacher.contractStatus !== 'active') return false;
      const hasAvailability = availability.some(
        a => a.teacherId === teacher.id && a.isAvailable
      );
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
      active: 'Activo',
      inactive: 'Inactivo',
      pending: 'Pendiente',
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
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full"
        />
        {filterParam === 'missing_availability' && (
          <div className="mt-4 p-3 bg-amber-50 text-amber-800 border-l-4 border-amber-500 font-medium text-sm flex justify-between items-center shadow-sm">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              Mostrando únicamente maestros activos que NO han enviado su disponibilidad. Puedes enviarles un recordatorio por WhatsApp en 1 clic.
            </span>
            <a href="/maestros" className="text-amber-700 hover:text-amber-900 underline">
              Quitar filtro
            </a>
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
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Nombre</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Teléfono</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">
                  Disponibilidad
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Estado</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Creado por</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                    {searchTerm
                      ? 'No hay maestros que coincidan con tu búsqueda'
                      : 'No hay maestros registrados'}
                  </td>
                </tr>
              ) : (
                filteredTeachers.map(teacher => {
                  const hasAvail = availability.some(
                    a => a.teacherId === teacher.id && a.isAvailable
                  );

                  return (
                    <tr
                      key={teacher.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {teacher.firstName} {teacher.lastName}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{teacher.email}</td>
                      <td className="px-4 py-3 text-gray-700">{teacher.phone || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        {hasAvail ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Enviada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(teacher.contractStatus)}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">
                        {teacher.createdByUser
                          ? `${teacher.createdByUser.firstName || ''} ${
                              teacher.createdByUser.lastName || ''
                            }`.trim() || 'Admin'
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-2 justify-center items-center">
                          <button
                            type="button"
                            onClick={() => openWhatsAppPreview(teacher)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
                            title="Revisar o editar mensaje de WhatsApp antes de enviar"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Recordar</span>
                          </button>
                          <Button size="sm" variant="outline" onClick={() => onEdit?.(teacher)}>
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para revisar/editar el mensaje de WhatsApp antes de enviar */}
      {whatsAppTarget && (
        <Modal
          isOpen={!!whatsAppTarget}
          onClose={() => setWhatsAppTarget(null)}
          title={`Recordatorio de WhatsApp — ${whatsAppTarget.firstName} ${whatsAppTarget.lastName}`}
          size="lg"
        >
          <div className="p-2 space-y-4 text-left">
            <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-200 rounded-xl p-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-950">
                    Mensaje listo para enviar por WhatsApp
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    Puedes editar el texto para este maestro o guardar una nueva plantilla predeterminada.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingTemplate(!isEditingTemplate)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-colors shrink-0 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditingTemplate ? 'Ver vista previa' : 'Editar plantilla base'}
              </button>
            </div>

            {isEditingTemplate ? (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800">
                    Plantilla Predeterminada (se aplicará a todos los maestros):
                  </label>
                  <button
                    type="button"
                    onClick={handleResetDefaultTemplate}
                    className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-800 underline cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Restaurar original
                  </button>
                </div>
                <p className="text-[11px] text-gray-500">
                  Variables automáticas disponibles:{' '}
                  <code className="px-1.5 py-0.5 bg-white rounded border text-blue-700 font-mono">
                    {'{nombre}'}
                  </code>{' '}
                  <code className="px-1.5 py-0.5 bg-white rounded border text-blue-700 font-mono">
                    {'{correo}'}
                  </code>{' '}
                  <code className="px-1.5 py-0.5 bg-white rounded border text-blue-700 font-mono">
                    {'{link}'}
                  </code>
                </p>
                <textarea
                  rows={5}
                  value={baseTemplate}
                  onChange={e => setBaseTemplate(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none font-sans leading-relaxed"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditingTemplate(false)}
                  >
                    Cancelar
                  </Button>
                  <button
                    type="button"
                    onClick={handleSaveDefaultTemplate}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#061266] hover:bg-blue-800 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Guardar como Predeterminado
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700">
                    Mensaje que se enviará a {whatsAppTarget.firstName} {whatsAppTarget.lastName}:
                  </label>
                  {templateSaved && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Plantilla predeterminada guardada
                    </span>
                  )}
                </div>
                <textarea
                  rows={5}
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  className="w-full text-xs p-3.5 rounded-xl border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none font-sans leading-relaxed"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                Teléfono registrado:{' '}
                <strong>{whatsAppTarget.phone || 'Se seleccionará contacto en WhatsApp'}</strong>
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setWhatsAppTarget(null)}>
                  Cancelar
                </Button>
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Abrir WhatsApp y Enviar
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

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
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
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
              ))}
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
