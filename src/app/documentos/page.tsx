import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { DocumentManagement } from '@/components/documentos/DocumentManagement';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const prisma = new PrismaClient();
const REQUIRED_DOCS = 10;

export default async function DocumentosPage() {
  const teachers = await prisma.teacher.findMany({
    where: {
      contractStatus: { in: ['active', 'pending'] }
    },
    include: {
      documents: true
    },
    orderBy: {
      lastName: 'asc'
    }
  });

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Volver al Panel
              </Link>
            </div>
            <h1 className="text-3xl font-extrabold text-[#061266]">Gestión de Documentos</h1>
            <p className="text-gray-500">Control de expedientes de docentes</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
              <tr>
                <th className="p-4 font-semibold">Docente</th>
                <th className="p-4 font-semibold text-center">Progreso</th>
                <th className="p-4 font-semibold">Estado</th>
                <th className="p-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {teachers.map(teacher => {
                const docCount = teacher.documents.length;
                const isComplete = docCount >= REQUIRED_DOCS;

                return (
                  <tr key={teacher.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{teacher.lastName} {teacher.firstName}</div>
                      <div className="text-xs text-gray-500">{teacher.email}</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-medium text-gray-700">{docCount} / {REQUIRED_DOCS}</span>
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${isComplete ? 'bg-emerald-500' : 'bg-orange-500'}`}
                            style={{ width: `${(docCount / REQUIRED_DOCS) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {isComplete ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          Completo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          Faltan {REQUIRED_DOCS - docCount} docs
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <DocumentManagement teacher={teacher} requiredDocs={REQUIRED_DOCS} />
                    </td>
                  </tr>
                );
              })}
              {teachers.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    No hay docentes registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
