import { withAuth } from 'next-auth/middleware';

const publicRoutes = ['/sign-in', '/sign-up', '/forgot-password'];

export const authMiddleware = withAuth(
    {
        callbacks: {
            authorized: async ({ req, token }) => {
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
