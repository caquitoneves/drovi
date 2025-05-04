import { ReactNode } from 'react'
import AdminNav from './sidebar/admin-nav'
import BusinessNav from './sidebar/business-nav'
import MotoboyNav from './sidebar/motoboy-nav'

type Role = 'admin' | 'business' | 'motoboy'

interface SidebarProps {
    role: Role
    children?: ReactNode
}

export function Sidebar({ role, children }: SidebarProps) {
    return (
        <aside className="w-64 bg-white border-r h-full p-4">
            {role === 'admin' && <AdminNav />}
            {role === 'business' && <BusinessNav />}
            {role === 'motoboy' && <MotoboyNav />}
            {children}
        </aside>
    )
}
