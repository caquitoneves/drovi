// packages/auth/middleware.ts

import { withAuth } from 'next-auth/middleware';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/sign-in', '/sign-up', '/forgot-password'];

export const authMiddleware = withAuth(
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const pathname = req.nextUrl.pathname;
        const localeMatch = pathname.match(/^\/(pt|en|es)(\/|$)/);
        const localePrefix = localeMatch ? `/${localeMatch[1]}` : '';

        const pathWithoutLocale = pathname.replace(localePrefix, '') || '/';
        const isPublic = publicRoutes.includes(pathWithoutLocale);

        if (isPublic) return true;

        return !!token;
      },
    },
  }
);

// Corrige a tipagem esperada para compatibilidade com middleware do Next.js
export type AuthMiddleware = (req: NextRequest) => ReturnType<typeof authMiddleware>;
