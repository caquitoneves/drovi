// apps/web/components/motion-client.tsx
'use client';

import { domAnimation, LazyMotion, m } from 'framer-motion';

export const MotionDiv = ({ children }: { children: React.ReactNode }) => (
    <LazyMotion features={domAnimation}>
        <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {children}
        </m.div>
    </LazyMotion>
);