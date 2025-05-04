// apps/web/app/(portal)/(business)/layout.tsx
import { Sidebar } from '@repo/design-system/components/dashboard/base-layout'

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen">
            <Sidebar role="business" />
            <main className="flex-1 p-6">
                {children}
            </main>
        </div>
    )
}
