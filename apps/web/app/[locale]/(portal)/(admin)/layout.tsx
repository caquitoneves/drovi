//apps/web/app/[locale]/(portal)/(admin)/layout.tsx

import { Sidebar } from '@repo/design-system/components/dashboard/sidebar';
import { AdminNav } from '@repo/design-system/components/dashboard/sidebar/admin-nav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex">
            <Sidebar>
                <AdminNav />
            </Sidebar>
            <main className="flex-1 p-4">{children}</main>
        </div>
    );
}
