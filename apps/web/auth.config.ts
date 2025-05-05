// apps/web/auth.config.ts
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import type { NextAuthConfig } from 'next-auth';

type AuthResponse = {
    id: string;
    email: string;
    name?: string;
    accessToken: string;
    role?: string; // Adicionado campo role
};

export const authConfig: NextAuthConfig = {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                    redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
                }
            }
        }),
        Credentials({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text', placeholder: 'email@exemplo.com' },
                password: { label: 'Senha', type: 'password' },
            },
            async authorize(credentials): Promise<AuthResponse | null> {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(credentials),
                    });

                    if (!res.ok) {
                        const error = await res.json();
                        console.error('Falha na autenticação:', error);
                        return null;
                    }

                    const user = await res.json();

                    if (user?.id && user?.accessToken) {
                        return {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            accessToken: user.accessToken,
                            role: user.role || 'guest' // Valor padrão para role
                        };
                    }

                    return null;
                } catch (error) {
                    console.error('Erro durante autenticação:', error);
                    return null;
                }
            },
        }),
    ],
    pages: {
        signIn: '/sign-in',
        error: '/sign-in?error=auth', // Página para erros de autenticação
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.accessToken = (user as AuthResponse).accessToken;
                token.role = (user as AuthResponse).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                session.user.role = token.role as string;
                session.accessToken = token.accessToken as string;
            }
            return session;
        },
    },
    session: {
        strategy: 'jwt',
        maxAge: 24 * 60 * 60, // 1 dia
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
};