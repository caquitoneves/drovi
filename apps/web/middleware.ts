// apps/web/middleware.ts

import { NextResponse, type NextRequest } from 'next/server';
import acceptLanguage from 'accept-language';
import { AUTH_COOKIE_NAME } from '../common/constants';

const locales = ['pt', 'en', 'es'];
const defaultLocale = 'pt';
acceptLanguage.languages(locales);


// Rotas públicas
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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Verificar se a rota é pública
  const isPublic = publicRoutes.some(route =>
      pathname === route ||
      pathname.startsWith(`${route}/`) ||
      pathname.match(new RegExp(`^\\/(pt|en|es)${route.replace('/', '\\/')}(\\/|$)`))
  );

  if (isPublic) {
    return NextResponse.next();
  }

  // Tratamento de locale
  const localeMatch = pathname.match(/^\/(pt|en|es)(\/|$)/);
  const currentLocale = localeMatch?.[1] || defaultLocale;
  const hasLocale = Boolean(localeMatch);

  // Redirecionar para versão com locale se necessário
  if (!hasLocale) {
    const preferredLocale =
        acceptLanguage.get(req.headers.get('Accept-Language') || '') || defaultLocale;

    const newUrl = new URL(
        `/${preferredLocale}${pathname === '/' ? '' : pathname}`,
        req.url
    );
    newUrl.search = req.nextUrl.search;

    return NextResponse.redirect(newUrl);
  }

  // Verificar autenticação JWT
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      throw new Error('Token não encontrado');
    }

    // Chamada para a API do NestJS para validar o token
    const validationResponse = await fetch(`${process.env.API_URL}/auth/validate-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!validationResponse.ok) {
      throw new Error('Token inválido');
    }

    const userData = await validationResponse.json();

    // Adicionar informações do usuário aos headers da requisição
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', userData.sub);
    requestHeaders.set('x-user-email', userData.email);
    requestHeaders.set('x-user-role', userData.role || '');

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Erro na autenticação:', error);

    // Redirecionar para login se não autenticado
    const loginUrl = new URL(`/${currentLocale}/sign-in`, req.url);
    loginUrl.searchParams.set('redirect', pathname);

    // Limpar cookie inválido
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(AUTH_COOKIE_NAME);

    return response;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};