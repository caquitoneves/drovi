'use client'

import Link from 'next/link'
import { Package, Truck, Settings } from 'lucide-react'

export default function BusinessNav() {
    return (
        <nav className="flex flex-col gap-4">
            <Link href="/portal/business/dashboard" className="nav-link">
                <Package className="icon" />
                Entregas
            </Link>
            <Link href="/portal/business/motoboys" className="nav-link">
                <Truck className="icon" />
                Motoboys
            </Link>
            <Link href="/portal/business/settings" className="nav-link">
                <Settings className="icon" />
                Configurações
            </Link>
        </nav>
    )
}
