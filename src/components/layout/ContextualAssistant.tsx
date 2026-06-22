'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';

export function ContextualAssistant() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Diccionario de conocimiento contextual
  const getContextualHelp = () => {
    if (pathname.includes('/horarios')) {
      return {
        title: 'Ayuda: Gestión de Horarios',
        faqs: [
          { q: '¿Qué es una asignación?', a: 'Es la vinculación de un Maestro, una Materia y un Salón en un horario específico.' },
          { q: '¿Cómo sé si el maestro puede?', a: 'Al hacer clic en "Sugerir Maestro" o seleccionar manualmente, el sistema te avisará con una alerta roja si el maestro no está disponible o tiene choques de horario.' },
          { q: '¿Cómo envío los horarios?', a: 'Usa el botón superior "Generar PDFs". Esto generará una hoja limpia lista para descargar en PDF por cada grupo, la cual podrás enviar.' }
        ],
        tourId: 'horarios-tour'
      };
    }
    
    if (pathname.includes('/grupos')) {
      return {
        title: 'Ayuda: Grupos y Plantillas',
        faqs: [
          { q: '¿Qué es una plantilla?', a: 'Es el molde base de materias que llevará un grupo. Se usa para rellenar los horarios rápidamente después.' },
          { q: '¿Qué hace el botón Promover?', a: 'Clona la plantilla actual pero para el siguiente cuatrimestre, cargando en automático las nuevas materias de esa carrera.' },
        ],
        tourId: 'grupos-tour'
      };
    }

    if (pathname.includes('/maestros')) {
      return {
        title: 'Ayuda: Portal de Maestros',
        faqs: [
          { q: '¿Cómo ingresan los maestros?', a: 'Los maestros ingresan con su correo a través de /portal-docente. Desde ahí enviarán su disponibilidad.' },
          { q: '¿Para qué sirve el estatus?', a: 'Si un maestro está "Inactivo", no aparecerá en las sugerencias para asignar nuevos horarios.' }
        ],
        tourId: null
      };
    }

    return {
      title: 'Centro de Ayuda',
      faqs: [
        { q: '¿Cómo empiezo?', a: 'Te sugerimos empezar registrando a tus Maestros, luego crea los Grupos y finalmente asígnales Horarios.' }
      ],
      tourId: null
    };
  };

  const helpInfo = getContextualHelp();

  // Función para disparar eventos de tour
  const startTour = () => {
    setIsOpen(false);
    // Disparamos un evento custom que cada página escuchará si tiene un tour configurado
    window.dispatchEvent(new CustomEvent('start-tour', { detail: { tourId: helpInfo.tourId } }));
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] print:hidden flex flex-col items-end">
      {/* Caja del chat/asistente */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 w-80 mb-4 overflow-hidden flex flex-col transform transition-all animate-in slide-in-from-bottom-4">
          <div className="bg-[#061266] text-white p-4 flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2">
              🤖 {helpInfo.title}
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-300">
              ✖
            </button>
          </div>
          
          <div className="p-4 flex-1 max-h-[60vh] overflow-y-auto">
            <p className="text-sm text-gray-600 mb-4">
              Estoy aquí para ayudarte. Basado en la pantalla donde estás, estas son las dudas más comunes:
            </p>
            
            <div className="space-y-4">
              {helpInfo.faqs.map((faq, idx) => (
                <div key={idx} className="bg-blue-50 rounded-lg p-3">
                  <h4 className="text-sm font-bold text-blue-900 mb-1">{faq.q}</h4>
                  <p className="text-xs text-blue-800 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
          
          {helpInfo.tourId && (
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <button 
                onClick={startTour}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                🧭 Iniciar Tour Guiado de esta página
              </button>
            </div>
          )}
        </div>
      )}

      {/* Botón Flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#061266] hover:bg-blue-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center border-2 border-white group"
        aria-label="Abrir asistente de ayuda"
      >
        <span className="text-2xl group-hover:scale-110 transition-transform">
          {isOpen ? '×' : '💡'}
        </span>
      </button>
    </div>
  );
}
