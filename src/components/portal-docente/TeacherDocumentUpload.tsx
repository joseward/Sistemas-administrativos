'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input } from '@/components/ui';

interface TeacherDocumentUploadProps {
  teacherId: string;
}

interface DocumentInfo {
  type: string;
  label: string;
  accepted: string;
  descriptionHint: string;
}

const REQUIRED_DOCUMENTS: DocumentInfo[] = [
  { type: 'CV', label: 'CV Actualizado', accepted: '.pdf,.doc,.docx', descriptionHint: 'Ej. CV José Manuel 2025' },
  { type: 'ACTA_NACIMIENTO', label: 'Acta de nacimiento actualizada', accepted: '.pdf,.doc,.docx', descriptionHint: 'Ej. Acta-Nacimiento-Jose' },
  { type: 'INE', label: 'INE (por ambos lados)', accepted: '.pdf,.doc,.docx', descriptionHint: 'Ej. INE-Ambos-Lados-Jose' },
  { type: 'COMPROBANTE_DOMICILIO', label: 'Comprobante de domicilio', accepted: '.pdf,.doc,.docx', descriptionHint: 'Ej. CFE-Enero-Jose' },
  { type: 'CONSTANCIA_FISCAL', label: 'Constancia de situación fiscal', accepted: '.pdf,.doc,.docx', descriptionHint: 'Ej. RFC-Jose-2025' },
  { type: 'CURP', label: 'CURP', accepted: '.pdf,.doc,.docx', descriptionHint: 'Ej. CURP-Actualizado-Jose' },
  { type: 'TITULO', label: 'Título', accepted: '.pdf,.doc,.docx', descriptionHint: 'Ej. Titulo-Licenciatura-Jose' },
  { type: 'CEDULA', label: 'Cédula', accepted: '.pdf,.doc,.docx', descriptionHint: 'Ej. Cedula-Estatal-Jose' },
  { type: 'REGISTRO_PROFESIONAL', label: 'Constancia de registro profesional Q. Roo', accepted: '.pdf,.doc,.docx', descriptionHint: 'Ej. Registro-QRoo-Jose' },
  { type: 'INFO_BANCO', label: 'Información de Banco', accepted: '.pdf,.doc,.docx', descriptionHint: 'Incluye Nombre, Cta, CLABE, Tarjeta, Banco' },
];

export function TeacherDocumentUpload({ teacherId }: TeacherDocumentUploadProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadDocuments = async () => {
    try {
      const res = await fetch(`/api/teachers/${teacherId}/documents`);
      const data = await res.json();
      if (data.success) {
        setDocuments(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [teacherId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, docInfo: DocumentInfo) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Generar descripción automática con la fecha actual
    const today = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const description = `${docInfo.label} - ${today}`;

    setUploadingType(docInfo.type);
    setErrorMsg('');
    setSuccessMsg('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', docInfo.type);
    formData.append('description', description);

    try {
      const res = await fetch(`/api/teachers/${teacherId}/documents`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMsg(`Documento ${docInfo.label} subido correctamente.`);
        loadDocuments();
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(`Error: ${data.error}`);
      }
    } catch (err) {
      setErrorMsg('Error de conexión al subir el documento.');
    } finally {
      setUploadingType(null);
      // Limpiar input file
      e.target.value = '';
    }
  };

  if (loading) {
    return <div className="text-center p-8">Cargando documentos...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto print:hidden">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#061266]">Expediente del Docente</h2>
        <p className="text-sm text-gray-500 mt-1">
          Sube la documentación requerida por el área administrativa. Todos los documentos deben ser escaneados y estar en formato PDF o Word.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
          ⚠️ {errorMsg}
        </div>
      )}
      
      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm">
          ✅ {successMsg}
        </div>
      )}

      <div className="space-y-4">
        {REQUIRED_DOCUMENTS.map((docInfo) => {
          const uploadedDoc = documents.find((d) => d.type === docInfo.type);
          
          return (
            <div key={docInfo.type} className="border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{docInfo.label}</h3>
                  {uploadedDoc ? (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium">Entregado</span>
                  ) : (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full font-medium">Pendiente</span>
                  )}
                </div>
                {uploadedDoc && uploadedDoc.description ? (
                  <p className="text-xs text-gray-500">Nota: {uploadedDoc.description}</p>
                ) : (
                  <p className="text-xs text-gray-500">Formato aceptado: PDF, Word.</p>
                )}
                {uploadedDoc && (
                  <a href={uploadedDoc.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                    Ver documento subido
                  </a>
                )}
              </div>

              <div className="flex flex-col md:flex-row items-end md:items-center gap-3">
                <div className="relative overflow-hidden inline-block shrink-0">
                  <Button 
                    variant={uploadedDoc ? 'secondary' : 'primary'}
                    isLoading={uploadingType === docInfo.type}
                    className="w-full md:w-auto relative"
                    as="span" // Prevent it from acting as a submit button implicitly if wrapped, but just for styling
                  >
                    {uploadedDoc ? 'Sustituir documento' : 'Subir documento'}
                  </Button>
                  <input
                    type="file"
                    accept={docInfo.accepted}
                    onChange={(e) => handleUpload(e, docInfo)}
                    disabled={uploadingType === docInfo.type}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
