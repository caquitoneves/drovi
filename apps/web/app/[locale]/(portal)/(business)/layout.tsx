// apps/web/app/[locale]/(portal)/(business)/layout.tsx

import { BaseLayout } from '@repo/design-system/components/dashboard/base-layout';

export default function AdminLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    return (
        <BaseLayout role="business">
            {children}
        </BaseLayout>
    );
}