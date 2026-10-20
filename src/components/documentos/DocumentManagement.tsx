'use client';

import React, { useState, useEffect } from 'react';
import { Button, Modal } from '@/components/ui';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
  Download,
  CheckCircle2,
  AlertCircle,
  Eye,
  Archive,
  MessageCircle,
  Edit3,
  RotateCcw,
  Check,
  Send,
} from 'lucide-react';

interface DocumentManagementProps {
  teacher: any;
  requiredDocs: number;
}

const REQUIRED_DOCUMENTS = [
  { type: 'CV', label: 'CV Actualizado' },
  { type: 'ACTA_NACIMIENTO', label: 'Acta de nacimiento' },
  { type: 'INE', label: 'INE (por ambos lados)' },
  { type: 'COMPROBANTE_DOMICILIO', label: 'Comprobante de domicilio' },
  { type: 'CONSTANCIA_FISCAL', label: 'Constancia de situación fiscal' },
  { type: 'CURP', label: 'CURP' },
  { type: 'TITULO', label: 'Título' },
  { type: 'CEDULA', label: 'Cédula' },
  { type: 'REGISTRO_PROFESIONAL', label: 'Registro profesional Q. Roo' },
  { type: 'INFO_BANCO', label: 'Información de Banco' },
];

const STORAGE_KEY_DOCS_TEMPLATE = 'aztlan_whatsapp_docs_template';

const DEFAULT_DOCS_TEMPLATE = `Hola Prof. {nombre}, le saludamos cordialmente de coordinación académica. Le escribimos para recordarle completar su expediente digital en el Portal Docente ({link}).

Documentos pendientes ({cantidad}):
{faltantes}

¡Muchas gracias por su apoyo!`;

export function DocumentManagement({ teacher, requiredDocs }: DocumentManagementProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  // Estado del modal de WhatsApp editable
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [baseTemplate, setBaseTemplate] = useState(DEFAULT_DOCS_TEMPLATE);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [templateSaved, setTemplateSaved] = useState(false);

  const documents = teacher.documents || [];

  const missingDocuments = REQUIRED_DOCUMENTS.filter(
    req => !documents.some((d: any) => d.type === req.type)
  );

  // Construir el mensaje reemplazando las variables dinámicas
  const buildMessageFromTemplate = (tpl: string) => {
    const portalUrl =
      typeof window !== 'undefined' ? `${window.location.origin}/portal-docente` : '';
    const missingList = missingDocuments.map(d => `• ${d.label}`).join('\n');
    const fullName = `${teacher.firstName} ${teacher.lastName}`.trim();

    if (missingDocuments.length === 0) {
      return `Hola Prof. ${fullName}, le confirmamos que su expediente digital se encuentra 100% completo. ¡Muchas gracias!`;
    }

    return tpl
      .replace(/\{nombre\}/g, fullName)
      .replace(/\{cantidad\}/g, String(missingDocuments.length))
      .replace(/\{faltantes\}/g, missingList)
      .replace(/\{link\}/g, portalUrl);
  };

  const openWhatsAppPreview = () => {
    const savedTpl =
      (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY_DOCS_TEMPLATE)) ||
      DEFAULT_DOCS_TEMPLATE;
    setBaseTemplate(savedTpl);
    setCustomMessage(buildMessageFromTemplate(savedTpl));
    setIsEditingTemplate(false);
    setIsWhatsAppModalOpen(true);
  };

  const handleSaveDefaultTemplate = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_DOCS_TEMPLATE, baseTemplate);
    }
    setCustomMessage(buildMessageFromTemplate(baseTemplate));
    setTemplateSaved(true);
    setTimeout(() => setTemplateSaved(false), 2500);
    setIsEditingTemplate(false);
  };

  const handleResetDefaultTemplate = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_DOCS_TEMPLATE);
    }
    setBaseTemplate(DEFAULT_DOCS_TEMPLATE);
    setCustomMessage(buildMessageFromTemplate(DEFAULT_DOCS_TEMPLATE));
  };

  const handleSendWhatsApp = () => {
    const cleanPhone = (teacher.phone || '').replace(/\D/g, '');
    const encodedMsg = encodeURIComponent(customMessage);
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone.length === 10 ? '52' + cleanPhone : cleanPhone}?text=${encodedMsg}`
      : `https://api.whatsapp.com/send?text=${encodedMsg}`;

    window.open(url, '_blank', 'noopener,noreferrer');
    setIsWhatsAppModalOpen(false);
  };

  const handleDownloadAll = async () => {
    if (documents.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();

      const downloadPromises = documents.map(async (doc: any) => {
        try {
          const response = await fetch(doc.fileUrl);
          if (response.ok) {
            const blob = await response.blob();
            const extension = doc.fileName.split('.').pop() || 'pdf';
            const safeName = `${doc.type}_${teacher.lastName}_${teacher.firstName}.${extension}`.replace(
              /\s+/g,
              '_'
            );
            zip.file(safeName, blob);
          }
        } catch (error) {
          console.error(`Error descargando ${doc.fileName}:`, error);
        }
      });

      await Promise.all(downloadPromises);

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `Expediente_${teacher.lastName}_${teacher.firstName}.zip`.replace(/\s+/g, '_'));
    } catch (error) {
      console.error('Error generando el ZIP:', error);
      alert('Hubo un error al generar el archivo ZIP.');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        {missingDocuments.length > 0 && (
          <button
            type="button"
            onClick={openWhatsAppPreview}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
            title={`Recordar por WhatsApp (${missingDocuments.length} documentos pendientes)`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Recordar</span>
          </button>
        )}
        <Button variant="secondary" onClick={() => setIsOpen(true)} className="text-xs">
          Ver Detalles
        </Button>
      </div>

      {/* Modal para revisar/editar el mensaje de WhatsApp antes de enviar */}
      <Modal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        title={`Recordatorio de WhatsApp — ${teacher.firstName} ${teacher.lastName}`}
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
                  Mensaje listo para enviar ({missingDocuments.length} documentos faltantes)
                </p>
                <p className="text-[11px] text-emerald-700">
                  Puedes editar el texto para este maestro o cambiar la plantilla predeterminada para todos.
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
                  {'{cantidad}'}
                </code>{' '}
                <code className="px-1.5 py-0.5 bg-white rounded border text-blue-700 font-mono">
                  {'{faltantes}'}
                </code>{' '}
                <code className="px-1.5 py-0.5 bg-white rounded border text-blue-700 font-mono">
                  {'{link}'}
                </code>
              </p>
              <textarea
                rows={7}
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
                  Mensaje que se enviará a {teacher.firstName} {teacher.lastName}:
                </label>
                {templateSaved && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Plantilla predeterminada guardada
                  </span>
                )}
              </div>
              <textarea
                rows={8}
                value={customMessage}
                onChange={e => setCustomMessage(e.target.value)}
                className="w-full text-xs p-3.5 rounded-xl border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none font-sans leading-relaxed"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              Teléfono registrado: <strong>{teacher.phone || 'Se seleccionará contacto en WhatsApp'}</strong>
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setIsWhatsAppModalOpen(false)}>
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

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Expediente: ${teacher.firstName} ${teacher.lastName}`}
        size="xl"
      >
        <div className="p-2 space-y-4">
          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-700">Progreso de entrega</p>
              <p className="text-2xl font-bold text-[#061266]">
                {documents.length}{' '}
                <span className="text-sm font-normal text-gray-500">de {requiredDocs} documentos</span>
              </p>
            </div>
            {documents.length >= requiredDocs ? (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                Expediente Completo
              </span>
            ) : (
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                Incompleto
              </span>
            )}
          </div>

          <div className="flex justify-end gap-2">
            {missingDocuments.length > 0 && (
              <button
                type="button"
                onClick={openWhatsAppPreview}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                Solicitar Faltantes por WhatsApp ({missingDocuments.length})
              </button>
            )}
            {documents.length > 0 && (
              <Button
                variant="primary"
                onClick={handleDownloadAll}
                isLoading={isZipping}
                className="text-sm flex items-center gap-1.5"
              >
                <Archive className="w-4 h-4" />
                Descargar Todos (.ZIP)
              </Button>
            )}
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-3 font-semibold text-gray-700">Documento Requerido</th>
                  <th className="p-3 font-semibold text-gray-700">Estado</th>
                  <th className="p-3 font-semibold text-gray-700">Descripción / Nombre</th>
                  <th className="p-3 font-semibold text-gray-700 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {REQUIRED_DOCUMENTS.map(req => {
                  const doc = documents.find((d: any) => d.type === req.type);

                  return (
                    <tr key={req.type} className={doc ? 'bg-white' : 'bg-red-50/30'}>
                      <td className="p-3 font-medium text-gray-900">{req.label}</td>
                      <td className="p-3">
                        {doc ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Entregado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-red-600 text-xs font-semibold">
                            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                            Falta
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-gray-500 text-xs max-w-[200px] truncate">
                        {doc ? (
                          <div className="flex flex-col">
                            <span className="truncate" title={doc.fileName}>
                              {doc.fileName}
                            </span>
                            {doc.description && (
                              <span
                                className="text-gray-400 truncate italic"
                                title={doc.description}
                              >
                                Nota: {doc.description}
                              </span>
                            )}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {doc ? (
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 rounded transition-colors"
                              title="Ver en el navegador"
                            >
                              <Eye className="w-3.5 h-3.5 text-gray-500" />
                              Ver
                            </a>
                            <a
                              href={`${doc.fileUrl}?download=`}
                              download={doc.fileName}
                              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded transition-colors"
                              title="Forzar descarga"
                            >
                              <Download className="w-3.5 h-3.5 text-blue-600" />
                              Descargar
                            </a>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">No disponible</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </>
  );
}
