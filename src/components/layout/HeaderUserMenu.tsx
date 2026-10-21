'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, ChevronDown, BookOpen } from 'lucide-react';

export function HeaderUserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Cerrar el menú si se hace clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Error logging out');
    }
    // Redirigir forzando la recarga para limpiar el estado
    window.location.href = '/login';
  };

  const manualHref = pathname?.startsWith('/portal-docente') ? '/manual?role=docente' : '/manual';

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-4 text-sm font-medium hover:opacity-80 transition-opacity focus:outline-none cursor-pointer"
      >
        <span className="text-gray-300 hidden md:inline">Sede: <strong className="text-white">Playa del Carmen</strong></span>
        <div className="w-8 h-8 rounded-full bg-[#fdb515] flex items-center justify-center text-[#061266] font-bold shadow-sm">
          AD
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-gray-300 -ml-2 hidden md:inline" />
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-52 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="py-1 divide-y divide-gray-100">
            <Link
              href={manualHref}
              onClick={() => setIsOpen(false)}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2 transition-colors font-medium"
            >
              <BookOpen className="w-4 h-4 text-[#061266]" /> Manual de Usuario
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-500" /> Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
