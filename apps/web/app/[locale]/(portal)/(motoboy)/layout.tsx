// apps/web/app/(portal)/(motoboy)/layout.tsx

import { Sidebar } from '@repo/design-system/components/dashboard/sidebar';
import { MotoboyNav } from '@repo/design-system/components/dashboard/sidebar/motoboy-nav';

export default function MotoboyLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex">
            <Sidebar>
                <MotoboyNav />
            </Sidebar>
            <main className="flex-1 p-4">{children}</main>
        </div>
    );
}