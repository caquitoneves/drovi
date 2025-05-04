'use client'

import Link from 'next/link'
import { MapPin, Clock, Settings } from 'lucide-react'

export default function MotoboyNav() {
    return (
        <nav className="flex flex-col gap-4">
            <Link href="/portal/motoboy/dashboard" className="nav-link">
                <MapPin className="icon" />
                Minhas entregas
            </Link>
            <Link href="/portal/motoboy/historico" className="nav-link">
                <Clock className="icon" />
                Histórico
            </Link>
            <Link href="/portal/motoboy/settings" className="nav-link">
                <Settings className="icon" />
                Configurações
            </Link>
        </nav>
    )
}
