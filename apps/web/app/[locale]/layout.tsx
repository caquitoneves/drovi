//apps/web/app/[locale]/layout.tsx

export const dynamic = 'force-dynamic';

import './styles.css';
import { DesignSystemProvider } from '@repo/design-system';
import { fonts } from '@repo/design-system/lib/fonts';
import { cn } from '@repo/design-system/lib/utils';
import { getDictionary } from '@repo/internationalization';
import type { ReactNode } from 'react';

type RootLayoutProperties = {
    readonly children: ReactNode;
    readonly params: {
        locale: string;
    };
};

const RootLayout = async ({ children, params }: RootLayoutProperties) => {
    const dictionary = await getDictionary(params.locale);

    return (
        <html
            lang={params.locale}
            className={cn(fonts, 'scroll-smooth')}
            suppressHydrationWarning
        >
        <body>
        <DesignSystemProvider>
            {children}
        </DesignSystemProvider>
        </body>
        </html>
    );
};

export default RootLayout;
