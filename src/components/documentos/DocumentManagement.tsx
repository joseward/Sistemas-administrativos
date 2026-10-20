'use client';

import React, { useState } from 'react';
import { Button, Modal } from '@/components/ui';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Download, CheckCircle2, AlertCircle, Eye, Archive, MessageCircle } from 'lucide-react';

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

export function DocumentManagement({ teacher, requiredDocs }: DocumentManagementProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const documents = teacher.documents || [];

  const missingDocuments = REQUIRED_DOCUMENTS.filter(
    req => !documents.some((d: any) => d.type === req.type)
  );

  const handleWhatsAppRemindDocs = () => {
    const cleanPhone = (teacher.phone || '').replace(/\D/g, '');
    const portalUrl = typeof window !== 'undefined' ? `${window.location.origin}/portal-docente` : '';
    const missingList = missingDocuments.map(d => `• ${d.label}`).join('\n');

    const message = missingDocuments.length > 0
      ? `Hola Prof. ${teacher.firstName} ${teacher.lastName}, le saludamos cordialmente de coordinación académica. Le escribimos para recordarle completar su expediente digital en el Portal Docente (${portalUrl}).\n\nDocumentos pendientes (${missingDocuments.length}):\n${missingList}\n\n¡Muchas gracias por su apoyo!`
      : `Hola Prof. ${teacher.firstName} ${teacher.lastName}, le confirmamos que su expediente digital se encuentra 100% completo. ¡Muchas gracias!`;

    const encodedMsg = encodeURIComponent(message);
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone.length === 10 ? '52' + cleanPhone : cleanPhone}?text=${encodedMsg}`
      : `https://api.whatsapp.com/send?text=${encodedMsg}`;

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadAll = async () => {
    if (documents.length === 0) return;
    
    setIsZipping(true);
    try {
      const zip = new JSZip();
      
      // Creamos una promesa para cada descarga
      const downloadPromises = documents.map(async (doc: any) => {
        try {
          const response = await fetch(doc.fileUrl);
          if (response.ok) {
            const blob = await response.blob();
            // Agregar al zip (el nombre será algo como: ACTA_NACIMIENTO_Jose_Cruz.pdf)
            const extension = doc.fileName.split('.').pop() || 'pdf';
            const safeName = `${doc.type}_${teacher.lastName}_${teacher.firstName}.${extension}`.replace(/\s+/g, '_');
            zip.file(safeName, blob);
          }
        } catch (error) {
          console.error(`Error descargando ${doc.fileName}:`, error);
        }
      });

      await Promise.all(downloadPromises);
      
      // Generar y descargar el archivo ZIP
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
            onClick={handleWhatsAppRemindDocs}
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
                {documents.length} <span className="text-sm font-normal text-gray-500">de {requiredDocs} documentos</span>
              </p>
            </div>
            {documents.length >= requiredDocs ? (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">Expediente Completo</span>
            ) : (
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">Incompleto</span>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            {missingDocuments.length > 0 && (
              <button
                type="button"
                onClick={handleWhatsAppRemindDocs}
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
                {REQUIRED_DOCUMENTS.map((req) => {
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
                            <span className="truncate" title={doc.fileName}>{doc.fileName}</span>
                            {doc.description && <span className="text-gray-400 truncate italic" title={doc.description}>Nota: {doc.description}</span>}
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
