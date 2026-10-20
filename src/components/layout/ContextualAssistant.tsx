'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bot,
  X,
  Send,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Loader2,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

interface AssistantAction {
  type: 'NAVIGATE' | 'START_TOUR' | 'REFRESH_DATA' | 'WHATSAPP';
  url?: string;
  label?: string;
  tourId?: string;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  actions?: AssistantAction[];
}

const INITIAL_MESSAGE: ChatMessage = {
  role: 'model',
  text: '¡Hola! Soy tu **Copiloto Administrativo con IA Gemini**. Conozco toda la plataforma y los datos en vivo de tu escuela.\n\nPuedes preguntarme cómo funciona cualquier sección, consultar qué materias o maestros están pendientes, o pedirme que realice una acción por ti.',
};

export function ContextualAssistant() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isOpen, isLoading]);

  // Ocultar asistente en login, en el portal del docente y en la sección de maestros
  if (
    pathname.includes('/login') ||
    pathname.includes('/portal-docente') ||
    pathname.includes('/maestros')
  ) {
    return null;
  }

  // Sugerencias rápidas contextuales según la pantalla actual
  const getQuickPrompts = () => {
    if (pathname.includes('/horarios')) {
      return [
        '¿Qué materias faltan por asignar?',
        'Muéstrame solo las materias pendientes',
        'Inicia el tour guiado de horarios',
      ];
    }

    if (pathname.includes('/grupos')) {
      return [
        '¿Cuántos grupos y plantillas tenemos?',
        '¿Cómo funciona el botón Promover Todos?',
        'Inicia el tour guiado de grupos',
      ];
    }

    if (pathname.includes('/maestros')) {
      return [
        '¿Qué maestros no han enviado disponibilidad?',
        'Filtra los maestros sin disponibilidad',
        'Llévame a Contratos de Maestros',
      ];
    }

    return [
      '¿Qué materias faltan por asignar?',
      '¿A qué maestros les faltan documentos?',
      'Llévame a las materias pendientes en Horarios',
    ];
  };

  const quickPrompts = getQuickPrompts();

  const startTour = (tourId: string) => {
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('start-tour', { detail: { tourId } }));
  };

  const sendMessage = async (textToSend?: string) => {
    const trimmed = (textToSend ?? input).trim();
    if (!trimmed || isLoading) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', text: trimmed }];
    setMessages(newMessages);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const historyForApi = newMessages.slice(-10).map(m => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyForApi,
          pathname,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setMessages(prev => [
          ...prev,
          {
            role: 'model',
            text: data.error || 'No pude procesar tu solicitud en este momento. Intenta de nuevo.',
          },
        ]);
      } else {
        const actions: AssistantAction[] = data.actions || [];
        setMessages(prev => [
          ...prev,
          {
            role: 'model',
            text: data.reply,
            actions,
          },
        ]);

        // Ejecutar acciones automáticas en el cliente si corresponde
        actions.forEach(action => {
          if (action.type === 'NAVIGATE' && action.url) {
            router.push(action.url);
          } else if (action.type === 'START_TOUR' && action.tourId) {
            setTimeout(() => startTour(action.tourId!), 400);
          } else if (action.type === 'REFRESH_DATA') {
            router.refresh();
          }
        });
      }
    } catch (error) {
      console.error('Error calling AI assistant:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: 'Error de conexión con el servidor. Por favor verifica tu conexión.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizado ligero de formato Markdown (negritas, cursivas y saltos de línea)
  const formatMessageText = (text: string) => {
    const normalized = text.replace(/\*\*\s*\n\s*/g, '**');
    return normalized.split('\n').map((line, i) => {
      if (line.trim() === '---') {
        return <hr key={i} className="my-2 border-gray-200" />;
      }
      const parts = line.split(/(\*\*.*?\*\*|\*[^*]+?\*)/g);
      return (
        <p key={i} className={`${line.trim() === '' ? 'h-2' : 'mb-1 last:mb-0'}`}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={j} className="font-bold">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
              return (
                <span key={j} className="text-gray-600 italic">
                  {part.slice(1, -1)}
                </span>
              );
            }
            return <span key={j}>{part}</span>;
          })}
        </p>
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] print:hidden flex flex-col items-end">
      {/* Ventana del Copiloto IA con altura fija y scroll interno garantizado */}
      {isOpen && (
        <div
          style={{ height: '500px', maxHeight: 'calc(100vh - 130px)' }}
          className="bg-white rounded-2xl shadow-2xl border border-blue-200/80 w-[360px] sm:w-[400px] mb-4 overflow-hidden flex flex-col transform transition-all animate-in slide-in-from-bottom-4"
        >
          {/* Cabecera Fija (Siempre visible) */}
          <div className="bg-gradient-to-r from-[#061266] to-blue-900 text-white px-4 py-3.5 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <Sparkles className="w-4 h-4 text-[#fdb515]" />
              </div>
              <div>
                <h3 className="font-bold text-sm flex items-center gap-1.5">
                  Copiloto IA Aztlán
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fdb515] text-[#061266]">
                    Gemini
                  </span>
                </h3>
                <p className="text-[11px] text-blue-200">Asistente inteligente en tiempo real</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 1 && (
                <button
                  onClick={() => setMessages([INITIAL_MESSAGE])}
                  className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title="Limpiar conversación"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Cerrar chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Área de Mensajes con Scroll de Rueda de Mouse */}
          <div
            ref={messagesContainerRef}
            className="p-4 flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-3 bg-gray-50/60"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-2xs ${
                    msg.role === 'user'
                      ? 'bg-[#061266] text-white rounded-br-xs'
                      : 'bg-white text-gray-800 border border-gray-200/80 rounded-bl-xs'
                  }`}
                >
                  {formatMessageText(msg.text)}

                  {/* Botones de acciones ejecutadas o sugeridas */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-gray-100 flex flex-col gap-1.5">
                      {msg.actions.map((act, aIdx) => {
                        if (act.type === 'WHATSAPP' && act.url) {
                          return (
                            <a
                              key={aIdx}
                              href={act.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              {act.label || 'Abrir WhatsApp'}
                            </a>
                          );
                        }
                        if ((act.type === 'NAVIGATE' || act.type === 'REFRESH_DATA') && act.url) {
                          return (
                            <button
                              key={aIdx}
                              onClick={() => router.push(act.url!)}
                              className="inline-flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-xs transition-colors cursor-pointer"
                            >
                              <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                {act.label || 'Ver sección'}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start">
                <div className="bg-white border border-gray-200/80 rounded-2xl rounded-bl-xs px-3.5 py-2.5 text-xs text-gray-500 flex items-center gap-2 shadow-2xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span>Analizando y ejecutando...</span>
                </div>
              </div>
            )}

            {/* Sugerencias rápidas iniciales */}
            {messages.length === 1 && !isLoading && (
              <div className="pt-2 space-y-1.5">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-1">
                  Sugerencias rápidas:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {quickPrompts.map((prompt, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => sendMessage(prompt)}
                      className="text-left text-xs bg-white hover:bg-blue-50 text-blue-800 border border-blue-200/80 rounded-xl px-3 py-1.5 font-medium transition-colors shadow-2xs cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Caja de texto fija abajo para enviar mensaje a Gemini */}
          <form
            onSubmit={e => {
              e.preventDefault();
              sendMessage();
            }}
            className="p-3 bg-white border-t border-gray-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Pregúntame algo o pídeme una acción..."
              disabled={isLoading}
              className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-xl bg-[#061266] hover:bg-blue-800 disabled:opacity-40 text-white transition-colors cursor-pointer"
              title="Enviar"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Botón Flotante Principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#061266] hover:bg-blue-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center border-2 border-[#fdb515] group relative cursor-pointer"
        aria-label="Abrir Copiloto con IA"
      >
        {isOpen ? (
          <X className="w-6 h-6 transition-transform" />
        ) : (
          <div className="relative">
            <Bot className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
            <Sparkles className="w-3.5 h-3.5 text-[#fdb515] absolute -top-1 -right-1.5 animate-pulse" />
          </div>
        )}
      </button>
    </div>
  );
}
