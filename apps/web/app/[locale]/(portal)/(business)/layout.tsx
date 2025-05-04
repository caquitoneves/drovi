//apps/web/app/[locale]/(portal)/(business)/layout.tsx

import { Sidebar } from '@repo/design-system/components/dashboard/sidebar';
import { BusinessNav } from '@repo/design-system/components/dashboard/sidebar/business-nav';

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex">
            <Sidebar>
                <BusinessNav />
            </Sidebar>
            <main className="flex-1 p-4">{children}</main>
        </div>
    );
}
