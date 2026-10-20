'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  GraduationCap,
  Link2,
  Calendar,
  FileSignature,
  FolderOpen,
  CheckSquare,
  ShieldCheck,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Inicio', icon: Home, exact: true },
  { href: '/maestros', label: '1. Maestros', icon: Users, exact: true },
  { href: '/grupos', label: '2. Grupos', icon: GraduationCap },
  { href: '/fusion-grupos', label: '3. Fusión', icon: Link2 },
  { href: '/horarios', label: '4. Horarios', icon: Calendar },
  { href: '/maestros/contratos', label: '5. Contratos', icon: FileSignature },
  { href: '/documentos', label: '6. Expedientes', icon: FolderOpen },
  { href: '/asistencia', label: '7. Asistencia', icon: CheckSquare },
  { href: '/usuarios', label: 'Accesos', icon: ShieldCheck },
];

export function TopNavBar() {
  const pathname = usePathname();

  // Ocultar en el menú principal (/), en login y en portal docente; mostrar solo dentro de los departamentos
  if (!pathname || pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/portal-docente')) {
    return null;
  }

  return (
    <nav className="bg-[#040d4a] border-t border-white/10 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#fdb515] text-[#061266] shadow-sm'
                    : 'text-blue-100/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#061266]' : 'text-blue-300'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
