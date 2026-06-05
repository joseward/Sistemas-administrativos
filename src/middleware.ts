import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const encoder = new TextEncoder();

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Archivos estáticos o rutas internas de Next.js
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/public') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico)$/)
  ) {
    return NextResponse.next();
  }

  // Rutas públicas que no necesitan middleware o se manejan por separado
  if (pathname.startsWith('/api/auth/login')) {
    return NextResponse.next();
  }

  // Leer la cookie
  const token = request.cookies.get('auth-token')?.value;

  // Si no hay token y quiere entrar a cualquier página que NO sea /login, redirigir a /login
  if (!token && pathname !== '/login') {
    // Si intenta llamar a otra API sin token, devolvemos 401
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si hay token, vamos a verificar su validez
  if (token) {
    try {
      const { payload } = await jwtVerify(token, encoder.encode(JWT_SECRET));
      
      // Si el token es válido y está intentando ir a /login, lo mandamos al panel
      if (pathname === '/login') {
        if (payload.role === 'admin') {
          return NextResponse.redirect(new URL('/', request.url));
        } else if (payload.role === 'docente') {
          return NextResponse.redirect(new URL('/portal-docente', request.url));
        }
        return NextResponse.redirect(new URL('/', request.url));
      }

      // TODO: Añadir lógica para que los docentes no entren al panel de admin y viceversa
      
      return NextResponse.next();
    } catch (error) {
      // Si el token es inválido o expiró
      request.cookies.delete('auth-token');
      if (pathname !== '/login') {
        if (pathname.startsWith('/api')) {
          return NextResponse.json({ error: 'Sesión expirada' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  // Configurar las rutas en las que se ejecuta el middleware
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
