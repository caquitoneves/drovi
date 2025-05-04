// apps/web/hooks/useAnimatedRouter.ts
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function useAnimatedRouter() {
    const router = useRouter();
    const [isTransitioning, setIsTransitioning] = useState(false);

    const push = (path: string) => {
        setIsTransitioning(true);
        setTimeout(() => router.push(path), 500); // Tempo igual à duração da animação
    };

    return { push, isTransitioning };
}