'use client';
import React, { useState, useRef, useEffect } from 'react';

interface SearchableSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}

export function SearchableSelect({ value, onChange, options, placeholder = "Buscar...", className = "" }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const selectedOption = options.find(o => o.value === value);
  const filteredOptions = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div 
        className="w-full p-2 bg-transparent outline-none text-xs border border-transparent hover:border-gray-200 rounded cursor-pointer flex justify-between items-center print:border-none print:p-0"
        onClick={() => { setIsOpen(!isOpen); setSearch(""); }}
      >
        <span className="truncate flex-1 text-left">{selectedOption ? selectedOption.label : placeholder}</span>
        <span className="text-gray-400 text-[10px] ml-1 print:hidden">▼</span>
      </div>
      
      {isOpen && (
        <div className="absolute z-[999] w-64 sm:w-72 mt-1 bg-white border border-gray-200 shadow-xl rounded-md overflow-hidden left-0 print:hidden">
          <div className="p-2 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
            <span className="text-gray-400 text-sm">🔍</span>
            <input 
              type="text" 
              className="w-full bg-transparent outline-none text-xs" 
              placeholder="Escribe para buscar..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-xs text-gray-500 text-center">No se encontraron resultados</div>
            ) : (
              filteredOptions.map(opt => (
                <div 
                  key={opt.value} 
                  className={`p-2 text-xs cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 border-b border-gray-50 last:border-0 ${value === opt.value ? 'bg-emerald-100 font-bold text-emerald-800' : ''}`}
                  onClick={() => { onChange(opt.value); setIsOpen(false); }}
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
