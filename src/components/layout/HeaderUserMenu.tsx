'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function HeaderUserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
    // Redirigir a la pantalla de login
    router.push('/login');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-4 text-sm font-medium hover:opacity-80 transition-opacity focus:outline-none"
      >
        <span className="text-gray-300 hidden md:inline">Sede: <strong className="text-white">Playa del Carmen</strong></span>
        <div className="w-8 h-8 rounded-full bg-[#fdb515] flex items-center justify-center text-[#061266] font-bold shadow-sm">
          AD
        </div>
        <span className="text-xs text-gray-300 -ml-2 hidden md:inline">▼</span>
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-800">Administrador</p>
            <p className="text-xs text-gray-500 truncate">admin@institutotech.edu</p>
          </div>
          <div className="py-1">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
            >
              <span>🚪</span> Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
