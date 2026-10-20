import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    cookies().delete('auth-token');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al cerrar sesión' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  cookies().delete('auth-token');
  return NextResponse.redirect(new URL('/login', request.url));
}
