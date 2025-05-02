// apps/web/auth.config.ts

import Credentials from 'next-auth/providers/credentials';
import type { NextAuthConfig } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { Session } from 'next-auth';

type AuthResponse = {
    id: string;
    email: string;
    name?: string;
    accessToken: string;
};

export const authConfig: NextAuthConfig = {
    providers: [
        Credentials({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials): Promise<AuthResponse | null> {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(credentials),
                });

                if (!res.ok) return null;

                const user = await res.json();
                if (user && user.id && user.accessToken) return user;

                return null;
            },
        }),
    ],
    pages: {
        signIn: '/sign-in',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = (user as AuthResponse).id;
                token.accessToken = (user as AuthResponse).accessToken;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.accessToken = token.accessToken as string;
            }
            return session;
        },
    },
};
