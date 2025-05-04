'use client'

import Link from 'next/link'
import { Home, Users, Settings } from 'lucide-react'

export default function AdminNav() {
    return (
        <nav className="flex flex-col gap-4">
            <Link href="/portal/admin/dashboard" className="nav-link">
                <Home className="icon" />
                Dashboard
            </Link>
            <Link href="/portal/admin/users" className="nav-link">
                <Users className="icon" />
                Usuários
            </Link>
            <Link href="/portal/admin/settings" className="nav-link">
                <Settings className="icon" />
                Configurações
            </Link>
        </nav>
    )
}
