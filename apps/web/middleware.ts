// apps/web/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import acceptLanguage from 'accept-language';
import { AUTH_COOKIE_NAME } from '../common/constants/constantsDefinition';

// Configurações
const locales = ['pt', 'en', 'es'];
const defaultLocale = 'pt';
acceptLanguage.languages(locales);

// Rotas públicas (incluindo APIs públicas)
const publicRoutes = [
  '/',
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/api/auth',
  '/_next',
  '/static',
  '/favicon.ico'
];

// Mapeamento de roles para prefixos de rota
const ROLE_PATHS = {
  business: '/portal/business',
  motoboy: '/portal/motoboy',
  admin: '/portal/admin' // Opcional para futuras implementações
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const currentLocale = pathname.split('/')[1] || defaultLocale;

  // 1. Verificação de rotas públicas
  if (publicRoutes.some(route =>
      pathname === `/${currentLocale}${route}` ||
      pathname.startsWith(`/${currentLocale}${route}/`)
  )) {
    return NextResponse.next();
  }

  // 2. Redirecionamento de locale (se necessário)
  if (!locales.includes(currentLocale)) {
    const preferredLocale = acceptLanguage.get(req.headers.get('Accept-Language')) || defaultLocale;
    const newUrl = new URL(`/${preferredLocale}${pathname}`, req.url);
    return NextResponse.redirect(newUrl);
  }

  // 3. Validação de autenticação
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) throw new Error('Token não encontrado');

    // Validação do token na API
    const authResponse = await fetch(`${process.env.API_URL}/auth/validate-token`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!authResponse.ok) throw new Error('Token inválido');

    const userData = await authResponse.json();
    const userRole = userData.role; // 'business' ou 'motoboy'

    // 4. Verificação de acesso ao dashboard específico
    if (pathname.startsWith(`/${currentLocale}${ROLE_PATHS[userRole]}`)) {
      const headers = new Headers(req.headers);
      headers.set('x-user-id', userData.sub);
      headers.set('x-user-role', userRole);
      return NextResponse.next({ request: { headers } });
    }

    // Se tentar acessar dashboard não correspondente à role
    throw new Error('Acesso não autorizado para este perfil');

  } catch (error) {
    console.error('Middleware Error:', error.message);

    // Redirecionamento inteligente:
    const redirectUrl = new URL(`/${currentLocale}/sign-in`, req.url);
    redirectUrl.searchParams.set('error',
        error.message.includes('não autorizado') ? 'unauthorized' : 'unauthenticated'
    );

    const response = NextResponse.redirect(redirectUrl);
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};