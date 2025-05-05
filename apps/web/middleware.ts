import { NextResponse, type NextRequest } from 'next/server';
import acceptLanguage from 'accept-language';
import { AUTH_COOKIE_NAME } from '../common/constants/constantsDefinition';

// Configurações
const locales = ['pt', 'en', 'es'];
const defaultLocale = 'pt';
acceptLanguage.languages(locales);

// Rotas públicas (acessíveis sem autenticação)
const publicRoutes = [
  '/',                 // Rota raiz
  '/home',             // Página home
  '/sign-in',          // Login
  '/sign-up',          // Registro
  '/forgot-password',  // Recuperação de senha
  '/api/auth',         // API de autenticação
  '/_next',            // Arquivos estáticos do Next
  '/static',           // Arquivos estáticos
  '/favicon.ico'       // Favicon
];

// Mapeamento de roles para dashboards
const roleDashboardMap = {
  admin: '/portal/admin',
  business: '/portal/business',
  user: '/portal/dashboard',
  default: '/portal/dashboard'
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // DEBUG: Log da rota acessada
  console.log(`Acessando: ${pathname}`);

  // --------------------------------------------------
  // 1. PRIMEIRO VERIFICAMOS ROTAS PÚBLICAS ABSOLUTAS
  // --------------------------------------------------
  const isAbsolutePublicRoute = publicRoutes.some(route => {
    // Caso especial para rota raiz
    if (route === '/' && pathname === '/') return true;

    // Verifica rota exata ou subrotas
    return pathname === route || pathname.startsWith(`${route}/`);
  });

  if (isAbsolutePublicRoute) {
    console.log('Rota pública absoluta - acesso permitido');
    // Se for a raiz, redireciona para o locale padrão
    if (pathname === '/') {
      return NextResponse.redirect(new URL(`/${defaultLocale}/`, req.url));
    }
    return NextResponse.next();
  }

  // --------------------------------------------------
  // 2. EXTRAI LOCALE E VERIFICA ROTAS PÚBLICAS COM LOCALE
  // --------------------------------------------------
  const pathParts = pathname.split('/').filter(Boolean);
  const possibleLocale = pathParts[0];
  const hasValidLocale = locales.includes(possibleLocale);
  const currentLocale = hasValidLocale ? possibleLocale : defaultLocale;

  const isPublicRouteWithLocale = publicRoutes.some(route => {
    // Remove o locale da verificação
    const pathWithoutLocale = hasValidLocale
        ? `/${pathParts.slice(1).join('/')}`
        : pathname;

    return pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`);
  });

  if (isPublicRouteWithLocale) {
    console.log('Rota pública com locale - acesso permitido');
    return NextResponse.next();
  }

  // --------------------------------------------------
  // 3. REDIRECIONAMENTO DE LOCALE (SE NECESSÁRIO)
  // --------------------------------------------------
  if (!hasValidLocale && pathParts.length > 0) {
    const preferredLocale = acceptLanguage.get(req.headers.get('Accept-Language')) || defaultLocale;
    console.log(`Redirecionando para locale: ${preferredLocale}`);
    return NextResponse.redirect(new URL(`/${preferredLocale}${pathname}`, req.url));
  }

  // ----------------------------------------------------------------
  // 4. VERIFICAÇÃO DE AUTENTICAÇÃO (APENAS PARA ROTAS PROTEGIDAS)
  // ----------------------------------------------------------------
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      console.log('Token não encontrado - redirecionando para login');
      throw new Error('Acesso não autorizado');
    }

    const authResponse = await fetch(`${process.env.API_URL}/auth/validate-token`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!authResponse.ok) {
      console.log('Token inválido - redirecionando para login');
      throw new Error('Token inválido');
    }

    const userData = await authResponse.json();
    const userRole = userData.role;

    // Redirecionamento pós-login
    if (pathname === `/${currentLocale}/sign-in` || pathname === '/sign-in') {
      const dashboardPath = roleDashboardMap[userRole] || roleDashboardMap.default;
      console.log(`Redirecionando para dashboard: ${dashboardPath}`);
      return NextResponse.redirect(new URL(`/${currentLocale}${dashboardPath}`, req.url));
    }

    // Verificação de permissões
    if (pathname.startsWith(`/${currentLocale}/portal/admin`) && userRole !== 'admin') {
      throw new Error('Acesso negado: permissão insuficiente para admin');
    }

    if (pathname.startsWith(`/${currentLocale}/portal/business`) && userRole !== 'business') {
      throw new Error('Acesso negado: permissão insuficiente para business');
    }

    // Adiciona headers de usuário
    const headers = new Headers(req.headers);
    headers.set('x-user-id', userData.sub);
    headers.set('x-user-role', userRole);

    console.log('Acesso autorizado');
    return NextResponse.next({ request: { headers } });

  } catch (error: any) {
    console.error('Erro no middleware:', error.message);

    // Se for rota da API, retorna erro JSON
    if (pathname.startsWith('/api')) {
      return new NextResponse(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Redireciona para login
    const redirectUrl = new URL(`/${defaultLocale}/sign-in`, req.url);

    if (error.message.includes('permissão')) {
      redirectUrl.searchParams.set('error', 'forbidden');
    } else {
      redirectUrl.searchParams.set('error', 'unauthenticated');
    }

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