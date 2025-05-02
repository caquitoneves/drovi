import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@repo/auth/middleware';
import acceptLanguage from 'accept-language';

const locales = ['pt', 'en', 'es'];
const defaultLocale = 'pt';
acceptLanguage.languages(locales);

// Rotas públicas que não exigem autenticação (com ou sem barra no final)
const publicRoutes = ['/', '/sign-in', '/sign-up', '/forgot-password'];

export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;

  // Ignorar assets e rotas internas
  if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/static') ||
      pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // Detectar locale na URL
  const localeMatch = pathname.match(/^\/(pt|en|es)(\/|$)/);
  const currentLocale = localeMatch?.[1];
  const hasLocale = Boolean(currentLocale);

  // Redireciona para a URL com locale se não tiver
  if (!hasLocale) {
    const preferredLocale =
        acceptLanguage.get(req.headers.get('Accept-Language') || '') || defaultLocale;

    return NextResponse.redirect(
        new URL(`/${preferredLocale}${pathname === '/' ? '' : pathname}`, req.url)
    );
  }

  // Remove o locale da rota para checar se ela é pública
  const pathnameWithoutLocale = pathname.replace(`/${currentLocale}`, '') || '/';

  const isPublic = publicRoutes.includes(pathnameWithoutLocale);

  // Se for pública, permite sem autenticação
  if (isPublic) {
    return NextResponse.next();
  }

  // Aplica autenticação
  return authMiddleware(req);
}

export const config = {
  matcher: ['/((?!_next|.*\\..*|api).*)'],
};
