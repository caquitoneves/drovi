// packages/auth/auth.ts

import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';
import { AuthOptions } from 'next-auth';
import { prisma } from './lib/prisma';
import axios from 'axios';
// import type { OAuthConfig } from 'next-auth/providers';

type AppUser = {
    id: string;
    name?: string;
    email: string;
    token: string;
};

/*

const MicrosoftProvider = (options = {}): OAuthConfig<any> => ({
    id: 'microsoft',
    name: 'Microsoft',
    type: 'oauth',
    version: '2.0',
    authorization: {
        url: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        params: {
            scope: 'openid profile email',
            response_type: 'code',
        },
    },
    token: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    userinfo: 'https://graph.microsoft.com/v1.0/me',
    async profile(profile) {
        return {
            id: profile.id,
            name: profile.displayName,
            email: profile.userPrincipalName,
        };
    },
    clientId: process.env.MICROSOFT_CLIENT_ID!,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
    ...options,
});

*/

export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        AppleProvider({
            clientId: process.env.APPLE_CLIENT_ID!,
            clientSecret: process.env.APPLE_CLIENT_SECRET!,
        }),
        // MicrosoftProvider(),
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Senha', type: 'password' },
            },
            async authorize(credentials): Promise<AppUser | null> {
                try {
                    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/token`, {
                        email: credentials?.email,
                        password: credentials?.password,
                    });

                    const { user, access_token } = response.data;

                    if (user && access_token) {
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            token: access_token,
                        };
                    }

                    return null;
                } catch (error) {
                    console.error('Erro ao autenticar:', error);
                    return null;
                }
            },
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.accessToken = (user as AppUser).token ?? token.accessToken;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id as string;
            (session as any).accessToken = token.accessToken;
            return session;
        },
    },
    pages: {
        signIn: '/sign-in',
    },
    secret: process.env.NEXTAUTH_SECRET,
};
