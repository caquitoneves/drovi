//packages/design-system/components/dashboard/sidebar/business-nav.tsx

import Link from 'next/link';
import { LayoutDashboard, Package, Briefcase } from 'lucide-react';

export function BusinessNav() {
    return (
        <>
            <Link href="/portal/business/dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5" />
                <span className="hidden md:inline">Dashboard</span>
            </Link>
            <Link href="/portal/business/orders" className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                <span className="hidden md:inline">Pedidos</span>
            </Link>
            <Link href="/portal/business/companies" className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                <span className="hidden md:inline">Empresas</span>
            </Link>
        </>
    );
}
