'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'docente' | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, ingresa tu correo y contraseña.');
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role: selectedRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al iniciar sesión');
        return;
      }

      // Si todo es correcto, redirigimos
      if (selectedRole === 'admin') {
        router.push('/');
      } else if (selectedRole === 'docente') {
        router.push('/portal-docente');
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col font-sans bg-white overflow-y-auto overflow-x-hidden">
      {/* Contenedor Principal Divivido */}
      <div className="flex-1 flex flex-col lg:flex-row relative">
        
        {/* LADO IZQUIERDO: Branding y Patrón de Texto */}
        <div className="hidden lg:flex flex-col w-[55%] relative overflow-hidden bg-[#081a36] justify-center pl-8 xl:pl-12 py-12">
          {/* Círculo Decorativo */}
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#ff2a55] rounded-full opacity-20 blur-[60px]"></div>
          
          {/* Contenedor del texto repetido */}
          <div className="relative z-10 flex flex-col space-y-2 lg:space-y-4 pointer-events-none">
            {/* Primer línea rellena */}
            <h1 className="text-[4.5vw] xl:text-[6rem] leading-[0.85] font-black text-white tracking-tight m-0 drop-shadow-md whitespace-nowrap">
              PLAYA DEL CARMEN
            </h1>
            
            {/* Líneas repetidas con contorno */}
            {[...Array(8)].map((_, i) => (
              <h1 
                key={i} 
                className="text-[4.5vw] xl:text-[6rem] leading-[0.85] font-black tracking-tight m-0 whitespace-nowrap"
                style={{ 
                  color: 'transparent', 
                  WebkitTextStroke: '2px white',
                  opacity: 0.8 - (i * 0.08) // Ajustado para destacar en fondo oscuro
                }}
              >
                PLAYA DEL CARMEN
              </h1>
            ))}
          </div>

          {/* Mascota Superpuesta */}
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none p-8">
            <img 
              src="/mascota.png" 
              alt="Mascota Jaguar Aztlán" 
              className="w-auto max-w-full h-auto max-h-[80%] object-contain drop-shadow-2xl"
              // Agregamos una suave animación flotante en línea
              style={{ animation: 'float 6s ease-in-out infinite' }}
            />
          </div>

          {/* Animación flotante global (se puede mover a globals.css después) */}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes float {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-20px); }
              100% { transform: translateY(0px); }
            }
          `}} />
        </div>

        {/* LADO DERECHO: Formulario de Login y Fondo Azul Sólido */}
        <div className="w-full lg:w-[45%] bg-[#081a36] relative flex items-center justify-center p-6 lg:p-12 overflow-hidden">
          
          {/* Tarjeta de Login */}
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 relative z-10 flex flex-col items-center">
            
            {/* Logo */}
            <div className="mb-6 w-48">
              <img 
                src="/logo.png" 
                alt="Aztlán Playa del Carmen" 
                className="w-full h-auto"
                // En caso de que no haya imagen real, un texto de respaldo que se vea bien
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<div class="text-3xl font-black text-[#061266] text-center italic">Aztlán<br/><span class="text-sm font-normal not-italic text-gray-500">Playa del Carmen</span></div>';
                }}
              />
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-1">
              {selectedRole ? (selectedRole === 'admin' ? 'Acceso Administrador' : 'Acceso Docente') : 'Iniciar Sesión'}
            </h2>
            <p className="text-sm text-gray-500 mb-8 text-center">
              {selectedRole ? 'Ingresa tus credenciales para continuar' : 'Elige tu perfil para comenzar'}
            </p>

            {!selectedRole ? (
              <div className="w-full flex flex-col gap-4">
                <button 
                  onClick={() => setSelectedRole('admin')}
                  className="w-full border-2 border-gray-100 hover:border-[#1877f2] hover:bg-blue-50/50 p-4 rounded-2xl flex items-center gap-4 transition-all group"
                >
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    🛠️
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-gray-800 group-hover:text-[#1877f2] transition-colors">Personal Administrativo</h3>
                    <p className="text-xs text-gray-500 mt-1">Gestión de escuela, maestros y horarios</p>
                  </div>
                  <div className="text-gray-300 group-hover:text-[#1877f2] transition-colors">→</div>
                </button>

                <button 
                  onClick={() => setSelectedRole('docente')}
                  className="w-full border-2 border-gray-100 hover:border-emerald-500 hover:bg-emerald-50/50 p-4 rounded-2xl flex items-center gap-4 transition-all group"
                >
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    👨‍🏫
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">Docentes</h3>
                    <p className="text-xs text-gray-500 mt-1">Portal de clases, tareas y asistencias</p>
                  </div>
                  <div className="text-gray-300 group-hover:text-emerald-600 transition-colors">→</div>
                </button>
              </div>
            ) : (
              <form className="w-full space-y-5" onSubmit={handleLogin}>
                {/* Botón para regresar a seleccionar rol */}
                <button 
                  type="button" 
                  onClick={() => setSelectedRole(null)}
                  className="text-xs text-[#1877f2] font-medium hover:underline flex items-center gap-1 mb-2"
                >
                  ← Cambiar perfil
                </button>
              {/* Input Correo */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 ml-1">Correo electrónico</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">✉️</span>
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder-gray-400"
                    placeholder="Escribe tu correo electrónico"
                  />
                </div>
              </div>

              {/* Input Contraseña */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 ml-1">Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">🔒</span>
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder-gray-400"
                    placeholder="Escribe tu contraseña"
                  />
                  <button 
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-xs font-semibold text-center mt-2 bg-red-50 py-2 rounded-lg border border-red-100">
                  {error}
                </div>
              )}

                {/* Botón de Submit */}
                <div className="w-full pt-2">
                  <button type="submit" className={`w-full text-white font-medium py-3 rounded-xl transition-colors shadow-md hover:shadow-lg ${selectedRole === 'admin' ? 'bg-[#1877f2] hover:bg-[#1564cc]' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                    Iniciar Sesión
                  </button>
                </div>
              </form>
            )}

            {/* Enlaces inferiores ocultos */}
            <div className="mt-6 w-full border-b border-gray-100 pb-2"></div>

            {/* Powered by */}
            <div className="mt-4 flex flex-col items-center">
              <span className="text-[10px] text-gray-400 font-semibold mb-1">Powered by</span>
              <div className="flex items-center gap-1">
                <span className="text-gray-700 font-bold tracking-tight text-sm">Ing. Jose cruz</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* FOOTER INFERIOR (Oscuro) */}
      <div className="bg-[#1a1a1a] text-gray-400 text-xs py-3 px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between z-20">
        <div className="flex space-x-6 mb-2 md:mb-0">
          <a href="https://wa.me/qr/QCGCQSULZRBJD1" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Soporte</a>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex space-x-3 text-sm">
            <a href="https://www.facebook.com/ComunidadAztlanPlayaDelCarmen?locale=es_LA" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Facebook</a>
          </div>
        </div>
      </div>
      
    </div>
  );
}
