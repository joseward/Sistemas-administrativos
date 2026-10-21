'use client';

import Link from 'next/link';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { 
  Users, 
  Calendar, 
  GraduationCap, 
  Link as LinkIcon, 
  FileSignature, 
  FolderOpen, 
  CheckSquare, 
  Shield,
  ArrowRight,
  BookOpen
} from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-transparent p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center mt-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#061266] mb-3 tracking-tight">
            Panel de Administración
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-5">
            Gestión eficiente de docentes, horarios, grupos y asistencia
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/manual"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-blue-50 text-[#061266] border border-blue-200 shadow-2xs text-xs font-extrabold transition-all"
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              Manual de Usuario Paso a Paso (Administrador y Docente)
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Panel de Métricas (Semáforo) */}
        <DashboardMetrics />

        {/* Grid de Módulos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          {/* Maestros */}
          <Link href="/maestros" className="group h-full">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#061266]"></div>
              <div className="w-14 h-14 bg-[#061266]/10 text-[#061266] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Maestros</h3>
              <p className="text-gray-500 mb-8 flex-1 text-sm">Gestionar maestros, disponibilidad y contratos.</p>
              <div className="flex items-center text-[#061266] font-semibold text-sm group-hover:gap-2 transition-all gap-1">
                Ingresar <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Horarios */}
          <Link href="/horarios" className="group h-full">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#fdb515]"></div>
              <div className="w-14 h-14 bg-[#fdb515]/10 text-[#fdb515] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Horarios</h3>
              <p className="text-gray-500 mb-8 flex-1 text-sm">Asignar horarios, materias y grupos a docentes.</p>
              <div className="flex items-center text-[#fdb515] font-semibold text-sm group-hover:gap-2 transition-all gap-1">
                Ingresar <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Grupos */}
          <Link href="/grupos" className="group h-full">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#061266]"></div>
              <div className="w-14 h-14 bg-[#061266]/10 text-[#061266] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Grupos</h3>
              <p className="text-gray-500 mb-8 flex-1 text-sm">Gestionar grupos académicos, carreras y asignaturas.</p>
              <div className="flex items-center text-[#061266] font-semibold text-sm group-hover:gap-2 transition-all gap-1">
                Ingresar <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Fusionar Grupos */}
          <Link href="/fusion-grupos" className="group h-full">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#f97316]"></div>
              <div className="w-14 h-14 bg-[#f97316]/10 text-[#f97316] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <LinkIcon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fusión</h3>
              <p className="text-gray-500 mb-8 flex-1 text-sm">Unir materias compartidas entre distintas carreras.</p>
              <div className="flex items-center text-[#f97316] font-semibold text-sm group-hover:gap-2 transition-all gap-1">
                Ingresar <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Contratos */}
          <Link href="/maestros/contratos" className="group h-full">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#ff2a55]"></div>
              <div className="w-14 h-14 bg-[#ff2a55]/10 text-[#ff2a55] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileSignature className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Contratos</h3>
              <p className="text-gray-500 mb-8 flex-1 text-sm">Generar y administrar contratos digitales de docentes.</p>
              <div className="flex items-center text-[#ff2a55] font-semibold text-sm group-hover:gap-2 transition-all gap-1">
                Ingresar <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Documentos */}
          <Link href="/documentos" className="group h-full">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#0ea5e9]"></div>
              <div className="w-14 h-14 bg-[#0ea5e9]/10 text-[#0ea5e9] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FolderOpen className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Documentos</h3>
              <p className="text-gray-500 mb-8 flex-1 text-sm">Control de expedientes y documentación de docentes.</p>
              <div className="flex items-center text-[#0ea5e9] font-semibold text-sm group-hover:gap-2 transition-all gap-1">
                Ingresar <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Asistencia */}
          <Link href="/asistencia" className="group h-full">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#10b981]"></div>
              <div className="w-14 h-14 bg-[#10b981]/10 text-[#10b981] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CheckSquare className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Asistencia</h3>
              <p className="text-gray-500 mb-8 flex-1 text-sm">Registrar e imprimir listas de asistencia semanales.</p>
              <div className="flex items-center text-[#10b981] font-semibold text-sm group-hover:gap-2 transition-all gap-1">
                Ingresar <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Usuarios */}
          <Link href="/usuarios" className="group h-full">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#8b5cf6]"></div>
              <div className="w-14 h-14 bg-[#8b5cf6]/10 text-[#8b5cf6] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Usuarios</h3>
              <p className="text-gray-500 mb-8 flex-1 text-sm">Gestión de accesos y configuración de cuentas.</p>
              <div className="flex items-center text-[#8b5cf6] font-semibold text-sm group-hover:gap-2 transition-all gap-1">
                Ingresar <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

        </div>
      </div>
    </main>
  );
}
