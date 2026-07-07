'use client';

import Link from 'next/link';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Home() {
  return (
    <main className="min-h-screen bg-transparent p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center mt-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#061266] mb-3 tracking-tight">
            Panel de Administración
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
            Gestión eficiente de docentes, horarios, grupos y asistencia
          </p>
        </div>

        {/* Panel de Métricas (Semáforo) */}
        <DashboardMetrics />

        {/* Grid de Módulos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Maestros */}
          <Link
            href="/dashboard/teachers"
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border-t-4 border-[#061266] p-6 group"
          >
            <h2 className="text-2xl font-bold text-[#061266] mb-2 group-hover:text-[#1877f2] transition-colors">👨‍🏫 Maestros</h2>
            <p className="text-gray-600">
              Gestionar maestros, disponibilidad y contratos
            </p>
          </Link>

          {/* Horarios */}
          <Link
            href="/horarios"
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border-t-4 border-[#fdb515] p-6 group"
          >
            <h2 className="text-2xl font-bold text-[#061266] mb-2 group-hover:text-[#1877f2] transition-colors">📅 Horarios</h2>
            <p className="text-gray-600">
              Asignar horarios, materias y grupos
            </p>
          </Link>

          {/* Grupos */}
          <Link
            href="/grupos"
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border-t-4 border-[#061266] p-6 group"
          >
            <h2 className="text-2xl font-bold text-[#061266] mb-2 group-hover:text-[#1877f2] transition-colors">👥 Grupos</h2>
            <p className="text-gray-600">
              Gestionar grupos académicos y docentes
            </p>
          </Link>

          {/* Contratos */}
          <Link
            href="/maestros/contratos"
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border-t-4 border-[#ff2a55] p-6 group"
          >
            <h2 className="text-2xl font-bold text-[#061266] mb-2 group-hover:text-[#1877f2] transition-colors">📄 Contratos</h2>
            <p className="text-gray-600">
              Generar y firmar contratos digitales
            </p>
          </Link>

          {/* Documentos */}
          <Link
            href="/documentos"
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border-t-4 border-[#f97316] p-6 group"
          >
            <h2 className="text-2xl font-bold text-[#061266] mb-2 group-hover:text-[#1877f2] transition-colors">📁 Documentos</h2>
            <p className="text-gray-600">
              Control de expedientes de docentes
            </p>
          </Link>

          {/* Asistencia */}
          <Link
            href="/asistencia"
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border-t-4 border-[#fdb515] p-6 group"
          >
            <h2 className="text-2xl font-bold text-[#061266] mb-2 group-hover:text-[#1877f2] transition-colors">✅ Asistencia</h2>
            <p className="text-gray-600">
              Registrar y imprimir listas de asistencia
            </p>
          </Link>

          {/* Usuarios */}
          <Link
            href="/usuarios"
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border-t-4 border-[#061266] p-6 group"
          >
            <h2 className="text-2xl font-bold text-[#061266] mb-2 group-hover:text-[#1877f2] transition-colors">🔐 Usuarios</h2>
            <p className="text-gray-600">
              Gestión de accesos y cuentas del sistema
            </p>
          </Link>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-8 border border-blue-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            ✨ Características principales
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <li className="flex items-center">
              <span className="text-blue-500 mr-3">✓</span>
              Gestión centralizada de maestros y disponibilidad
            </li>
            <li className="flex items-center">
              <span className="text-blue-500 mr-3">✓</span>
              Asignación flexible de horarios y grupos
            </li>
            <li className="flex items-center">
              <span className="text-blue-500 mr-3">✓</span>
              Generación de contratos en PDF
            </li>
            <li className="flex items-center">
              <span className="text-blue-500 mr-3">✓</span>
              Listas de asistencia optimizadas para impresión
            </li>
            <li className="flex items-center">
              <span className="text-blue-500 mr-3">✓</span>
              Administración de usuarios y roles del sistema
            </li>
            <li className="flex items-center">
              <span className="text-blue-500 mr-3">✓</span>
              Autenticación segura de usuarios
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
