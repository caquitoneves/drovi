// apps/web/app/[locale]/(home)/layout.tsx

export const dynamic = 'force-dynamic';

import { DesignSystemProvider } from '@repo/design-system';
import { getDictionary } from '@repo/internationalization';
import type { ReactNode } from 'react';
import { Header } from './components/header';

type HomeLayoutProps = {
    children: ReactNode;
    params: {
        locale: string;
    };
};

const HomeLayout = async ({ children, params }: HomeLayoutProps) => {
    const dictionary = await getDictionary(params.locale);

    return (
        <DesignSystemProvider>
            <Header dictionary={dictionary} />
            {children}
        </DesignSystemProvider>
    );
};

export default HomeLayout;
