import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Obtener el token de las cookies
  const token = request.cookies.get('token')?.value;

  // 2. Si el usuario intenta entrar al dashboard y NO tiene token
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      // Redirigir al Login con un parámetro de error
      return NextResponse.redirect(new URL('/?error=unauthorized', request.url));
    }
  }

  // 3. (Opcional) Si el usuario YA tiene sesión y va al Login, mándalo al dashboard
  if (request.nextUrl.pathname === '/' && token) {
     return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configurar para que el middleware solo se ejecute en las rutas que queremos
export const config = {
  matcher: ['/dashboard/:path*', '/'],
};
