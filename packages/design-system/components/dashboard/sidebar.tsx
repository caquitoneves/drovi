'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MenuIcon, XIcon } from 'lucide-react';

interface SidebarProps {
    children: React.ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <aside
            className={cn(
                'transition-all h-screen bg-white dark:bg-zinc-900 border-r p-4 shadow-sm',
                expanded ? 'w-64' : 'w-20'
            )}
        >
            <div className="flex justify-end mb-4">
                <Button variant="ghost" size="icon" onClick={() => setExpanded(!expanded)}>
                    {expanded ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
                </Button>
            </div>
            <nav className="flex flex-col gap-3">{children}</nav>
        </aside>
    );
}
