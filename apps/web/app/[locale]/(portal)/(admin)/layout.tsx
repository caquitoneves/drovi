// apps/web/app/(portal)/(admin)/layout.tsx
import { Sidebar } from '@repo/design-system/components/dashboard/base-layout'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen">
            <Sidebar role="admin" />
            <main className="flex-1 p-6">
                {children}
            </main>
        </div>
    )
}
