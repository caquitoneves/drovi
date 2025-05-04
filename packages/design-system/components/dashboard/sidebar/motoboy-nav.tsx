//packages/design-system/components/dashboard/sidebar/motoboy-nav.tsx

import Link from 'next/link';
import { LayoutDashboard, MapPin, Clock } from 'lucide-react';

export function MotoboyNav() {
    return (
        <>
            <Link href="/portal/motoboy/dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5" />
                <span className="hidden md:inline">Dashboard</span>
            </Link>
            <Link href="/portal/motoboy/routes" className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span className="hidden md:inline">Rotas</span>
            </Link>
            <Link href="/portal/motoboy/schedule" className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span className="hidden md:inline">Agenda</span>
            </Link>
        </>
    );
}
