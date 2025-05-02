//packages/auth/provider.tsx

'use client';

import type { ReactNode } from 'react';
import { useTheme } from 'next-themes';
import { SessionProvider } from 'next-auth/react';

type AuthProviderProperties = {
  children: ReactNode;
  privacyUrl?: string;
  termsUrl?: string;
  helpUrl?: string;
};

export const AuthProvider = ({
                               children,
                               privacyUrl,
                               termsUrl,
                               helpUrl,
                             }: AuthProviderProperties) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const baseTheme = isDark ? 'dark' : undefined;

  return (
      <SessionProvider>
        {/* Você pode passar baseTheme, urls ou contexto adicional aqui se precisar */}
        {children}
      </SessionProvider>
  );
};
