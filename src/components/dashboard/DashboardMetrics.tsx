'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  Clock,
  FolderOpen,
  CheckCircle2,
  ArrowRight,
  Layers,
} from 'lucide-react';

export function DashboardMetrics() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [docStats, setDocStats] = useState({ missingDocsCount: 0, completeDocsCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/templates').then(res => res.json()).catch(() => []),
      fetch('/api/assignments').then(res => res.json()).catch(() => ({})),
      fetch('/api/availability').then(res => res.json()).catch(() => ({})),
      fetch('/api/teachers').then(res => res.json()).catch(() => ({})),
      fetch('/api/documents/stats').then(res => res.json()).catch(() => ({}))
    ])
      .then(([tplData, assignData, availData, teacherData, docData]) => {
        if (Array.isArray(tplData)) {
          setTemplates(tplData);
        } else if (Array.isArray(tplData?.data)) {
          setTemplates(tplData.data);
        }

        if (assignData?.success && Array.isArray(assignData.data)) {
          setAssignments(assignData.data);
        } else if (Array.isArray(assignData)) {
          setAssignments(assignData);
        }

        if (availData?.success && Array.isArray(availData.data)) {
          setAvailability(availData.data);
        } else if (Array.isArray(availData)) {
          setAvailability(availData);
        }

        if (teacherData?.success && Array.isArray(teacherData.data)) {
          setTeachers(teacherData.data);
        } else if (Array.isArray(teacherData)) {
          setTeachers(teacherData);
        }

        if (docData?.success && docData.data) {
          setDocStats(docData.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching dashboard metrics', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="h-36 animate-pulse bg-gray-100 rounded-2xl mb-8"></div>;
  }

  // 1. Calcular avance real desde las plantillas de la base de datos
  let incompleteTemplates = 0;
  let completeTemplates = 0;
  let totalTemplateSubjects = 0;
  let assignedTemplateSubjects = 0;

  templates.forEach(tpl => {
    const subjectIds: string[] = Array.isArray(tpl.subjectIds) ? tpl.subjectIds : [];
    if (subjectIds.length === 0) return;

    let missingInTemplate = 0;
    subjectIds.forEach(subjectId => {
      totalTemplateSubjects++;
      const isAssigned = assignments.some(a =>
        a.groupId === tpl.groupId &&
        a.modulo === tpl.modulo &&
        a.subjectId === subjectId &&
        a.teacherId &&
        a.teacherId !== 'mock-t-unassigned' &&
        !a.isAvailable
      );
      if (isAssigned) {
        assignedTemplateSubjects++;
      } else {
        missingInTemplate++;
      }
    });

    if (missingInTemplate > 0) {
      incompleteTemplates++;
    } else {
      completeTemplates++;
    }
  });

  const unassignedSubjectsCount = totalTemplateSubjects - assignedTemplateSubjects;
  const progressPercent = totalTemplateSubjects > 0
    ? Math.round((assignedTemplateSubjects / totalTemplateSubjects) * 100)
    : 0;

  // 2. Maestros activos sin disponibilidad
  const activeTeachers = teachers.filter(t => t.contractStatus === 'active');
  let missingAvailabilityCount = 0;

  activeTeachers.forEach(t => {
    const hasAvailability = availability.some(a => a.teacherId === t.id && a.isAvailable !== false);
    if (!hasAvailability) {
      missingAvailabilityCount++;
    }
  });

  return (
    <div className="space-y-6 mb-10">
      {/* Barra de Progreso General del Ciclo */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-12 h-12 rounded-xl bg-[#061266] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Layers className="w-6 h-6 text-[#fdb515]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <span className="text-sm font-bold text-[#061266] uppercase tracking-wide">
                  Avance de Planeación Académica
                </span>
                <span className="text-xs text-gray-500 ml-2 hidden sm:inline">
                  ({assignedTemplateSubjects} de {totalTemplateSubjects} materias con maestro asignado)
                </span>
              </div>
              <span className="text-sm font-black text-[#061266]">{progressPercent}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200/60">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  progressPercent === 100
                    ? 'bg-emerald-500'
                    : progressPercent >= 60
                    ? 'bg-blue-600'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {unassignedSubjectsCount > 0 ? (
          <Link
            href="/horarios?view=matrix&status=pending"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#061266] hover:bg-blue-900 text-white text-xs font-bold transition-colors shadow-sm whitespace-nowrap"
          >
            <span>Asignar {unassignedSubjectsCount} materias pendientes</span>
            <ArrowRight className="w-4 h-4 text-[#fdb515]" />
          </Link>
        ) : totalTemplateSubjects > 0 ? (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold whitespace-nowrap">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Planeación 100% cubierta
          </span>
        ) : (
          <Link
            href="/grupos"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors whitespace-nowrap"
          >
            <span>Crear primera plantilla</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Tarjetas del Semáforo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Tarjeta Roja: Faltan Asignaciones */}
        <Link
          href="/horarios?view=matrix&status=pending"
          className="bg-red-50 hover:bg-red-100/80 transition-all rounded-2xl p-5 border-l-4 border-red-500 shadow-sm flex flex-col justify-between cursor-pointer group"
        >
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-red-700 uppercase tracking-wide group-hover:text-red-900 transition-colors">
                Materias sin Maestro
              </p>
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
            <h3 className="text-3xl font-black text-red-900 mt-2">{unassignedSubjectsCount}</h3>
            <p className="text-red-800 text-xs mt-1">
              En {incompleteTemplates} plantilla{incompleteTemplates !== 1 ? 's' : ''} por completar
            </p>
          </div>
          <span className="text-[11px] font-bold text-red-700 mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Ir a Matriz Inteligente <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        {/* Tarjeta Amarilla: Faltan Horarios de Maestros */}
        <Link
          href="/maestros?filter=missing_availability"
          className="bg-amber-50 hover:bg-amber-100/80 transition-all rounded-2xl p-5 border-l-4 border-amber-500 shadow-sm flex flex-col justify-between cursor-pointer group"
        >
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide group-hover:text-amber-900 transition-colors">
                Sin Disponibilidad
              </p>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="text-3xl font-black text-amber-900 mt-2">{missingAvailabilityCount}</h3>
            <p className="text-amber-800 text-xs mt-1">
              Docentes activos pendientes de horario
            </p>
          </div>
          <span className="text-[11px] font-bold text-amber-700 mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Ver docentes y recordar <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        {/* Tarjeta Naranja: Faltan Documentos */}
        <Link
          href="/documentos"
          className="bg-orange-50 hover:bg-orange-100/80 transition-all rounded-2xl p-5 border-l-4 border-orange-500 shadow-sm flex flex-col justify-between cursor-pointer group"
        >
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-orange-700 uppercase tracking-wide group-hover:text-orange-900 transition-colors">
                Expedientes Incompletos
              </p>
              <FolderOpen className="w-4 h-4 text-orange-500" />
            </div>
            <h3 className="text-3xl font-black text-orange-900 mt-2">{docStats.missingDocsCount}</h3>
            <p className="text-orange-800 text-xs mt-1">
              Docentes con documentos faltantes
            </p>
          </div>
          <span className="text-[11px] font-bold text-orange-700 mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Revisar expedientes <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        {/* Tarjeta Verde: Todo en Orden */}
        <Link
          href="/horarios?view=matrix&status=assigned"
          className="bg-emerald-50 hover:bg-emerald-100/80 transition-all rounded-2xl p-5 border-l-4 border-emerald-500 shadow-sm flex flex-col justify-between cursor-pointer group"
        >
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide group-hover:text-emerald-900 transition-colors">
                Plantillas al 100%
              </p>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-3xl font-black text-emerald-900 mt-2">{completeTemplates}</h3>
            <p className="text-emerald-800 text-xs mt-1">
              {assignedTemplateSubjects} materias asignadas exitosamente
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Ver clases cubiertas <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>
    </div>
  );
}
