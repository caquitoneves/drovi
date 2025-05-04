// apps/web/app/(portal)/(motoboy)/layout.tsx
import { Sidebar } from '@repo/design-system/components/dashboard/base-layout'

export default function MotoboyLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen">
            <Sidebar role="motoboy" />
            <main className="flex-1 p-6">
                {children}
            </main>
        </div>
    )
}
