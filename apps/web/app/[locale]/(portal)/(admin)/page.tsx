// apps/web/app/[locale]/(portal)/(admin)/layout.tsx

import { BaseLayout } from '@repo/design-system/components/dashboard/base-layout';


export default function AdminLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    return (
        <BaseLayout role="admin">
            {children}
        </BaseLayout>
    );
}