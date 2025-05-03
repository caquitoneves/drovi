//packages/design-system/components/layouts/navigation-link.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';

export function NavTransitionLink({
                            href,
                            children,
                        }: {
    href: string;
    children: React.ReactNode;
}) {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <Link
                href={href}
                onClick={() => setIsLoading(true)}
                className="relative"
            >
                {children}
                {isLoading && (
                    <motion.span
                        className="absolute left-0 right-0 bottom-0 h-0.5 bg-blue-500"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.5 }}
                    />
                )}
            </Link>
        </motion.div>
    );
}