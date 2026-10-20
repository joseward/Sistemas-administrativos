'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { AlertCircle, CheckCircle2, FileText, Upload, ExternalLink } from 'lucide-react';

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
        setDocuments(data.data || []);
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
        setSuccessMsg(`Documento "${docInfo.label}" enviado correctamente a Coordinación.`);
        loadDocuments();
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(`Error: ${data.error}`);
      }
    } catch (err) {
      setErrorMsg('Error de conexión al subir el documento.');
    } finally {
      setUploadingType(null);
      e.target.value = '';
    }
  };

  if (loading) {
    return <div className="text-center p-8 text-gray-500">Cargando tu expediente digital...</div>;
  }

  const uploadedCount = REQUIRED_DOCUMENTS.filter(req =>
    documents.some(d => d.type === req.type)
  ).length;
  const totalCount = REQUIRED_DOCUMENTS.length;
  const progressPercent = Math.round((uploadedCount / totalCount) * 100);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:hidden">
      {/* Encabezado y Barra de Progreso del Expediente */}
      <div className="mb-6 pb-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#061266]">Expediente del Docente</h2>
          <p className="text-sm text-gray-500 mt-1">
            Sube tu documentación escaneada en formato PDF o Word. El área administrativa la recibe al instante.
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-w-[220px]">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-gray-700">
              {uploadedCount} de {totalCount} entregados
            </span>
            <span className={uploadedCount === totalCount ? 'text-emerald-600' : 'text-blue-600'}>
              {progressPercent}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                uploadedCount === totalCount ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="space-y-3">
        {REQUIRED_DOCUMENTS.map(docInfo => {
          const uploadedDoc = documents.find(d => d.type === docInfo.type);

          return (
            <div
              key={docInfo.type}
              className={`border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                uploadedDoc
                  ? 'border-emerald-200/80 bg-emerald-50/20'
                  : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-1">
                  <FileText
                    className={`w-4 h-4 shrink-0 ${
                      uploadedDoc ? 'text-emerald-600' : 'text-gray-400'
                    }`}
                  />
                  <h3 className="font-semibold text-gray-900 text-sm">{docInfo.label}</h3>
                  {uploadedDoc ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      Entregado
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                      Pendiente
                    </span>
                  )}
                </div>
                {uploadedDoc && uploadedDoc.description ? (
                  <p className="text-xs text-gray-500 pl-6">Nota: {uploadedDoc.description}</p>
                ) : (
                  <p className="text-xs text-gray-500 pl-6">Formato aceptado: PDF, Word.</p>
                )}
                {uploadedDoc && (
                  <a
                    href={uploadedDoc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline mt-1 pl-6"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Ver documento subido
                  </a>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="relative overflow-hidden inline-block">
                  <Button
                    variant={uploadedDoc ? 'secondary' : 'primary'}
                    isLoading={uploadingType === docInfo.type}
                    className="w-full md:w-auto relative flex items-center gap-1.5 text-xs"
                    as="span"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {uploadedDoc ? 'Sustituir documento' : 'Subir documento'}
                  </Button>
                  <input
                    type="file"
                    accept={docInfo.accepted}
                    onChange={e => handleUpload(e, docInfo)}
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
