//packages/design-system/components/dashboard/sidebar/admin-nav.tsx

import Link from 'next/link';
import { LayoutDashboard, Users, Settings } from 'lucide-react';

export function AdminNav() {
    return (
        <>
            <Link href="/portal/admin/dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5" />
                <span className="hidden md:inline">Dashboard</span>
            </Link>
            <Link href="/portal/admin/users" className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="hidden md:inline">Usuários</span>
            </Link>
            <Link href="/portal/admin/config" className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <span className="hidden md:inline">Configurações</span>
            </Link>
        </>
    );
}
