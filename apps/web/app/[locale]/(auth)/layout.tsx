// app/[locale]/(auth)/layout.tsx

import { DesignSystemProvider } from '@repo/design-system';
import { fonts } from '@repo/design-system/lib/fonts';
import { cn } from '@repo/design-system/lib/utils';
import type { ReactNode } from 'react';

type AuthLayoutProps = {
    children: ReactNode;
};

const AuthLayout = ({ children }: AuthLayoutProps) => {
    return (
        <div className={cn(fonts, 'scroll-smooth')}>
            <DesignSystemProvider>
                {children}
            </DesignSystemProvider>
        </div>
    );
};

export default AuthLayout;
