'use client';

import React, { useState } from 'react';
import { Button, Modal } from '@/components/ui';

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
  const documents = teacher.documents || [];

  return (
    <>
      <Button variant="secondary" onClick={() => setIsOpen(true)} className="text-xs">
        Ver Detalles
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Expediente: ${teacher.firstName} ${teacher.lastName}`}
        size="lg"
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
                          <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-medium">
                            ✅ Entregado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600 text-xs font-medium">
                            ❌ Falta
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
                          <a 
                            href={doc.fileUrl}
                            download={doc.fileName}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded transition-colors"
                          >
                            Descargar
                          </a>
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
