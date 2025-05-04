'use client';

import { env } from '@/env';
import { MoveRight, PhoneCall } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@repo/design-system/components/ui/button';
import type { Dictionary } from '@repo/internationalization';

type HeroProps = {
    dictionary: Dictionary;
};

export const Hero = ({ dictionary }: HeroProps) => (
    <div className="relative w-full overflow-hidden bg-white dark:bg-black">
        {/* Fundo animado */}
        <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
        >
            <div className="h-[500px] w-[500px] rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-900/40" />
        </motion.div>

        {/* Conteúdo */}
        <div className="container mx-auto">
            <div className="flex flex-col items-center justify-center gap-8 py-20 lg:py-40">
                <div className="flex flex-col gap-4">
                    <h1 className="max-w-2xl text-center font-regular text-3xl tracking-tight text-gray-900 dark:text-white md:text-5xl">
                        {dictionary.web.home.meta.title}
                    </h1>
                    <p className="max-w-2xl text-center text-base leading-relaxed tracking-tight text-gray-600 dark:text-gray-300 md:text-lg">
                        {dictionary.web.home.meta.description}
                    </p>
                </div>
                <div className="flex flex-row gap-3">
                    <Button size="lg" className="gap-4" variant="outline" asChild>
                        <Link href="/contact">
                            {dictionary.web.home.hero.primaryCta}
                            <PhoneCall className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button size="lg" className="gap-4" asChild>
                        <Link href={env.NEXT_PUBLIC_APP_URL}>
                            {dictionary.web.home.hero.secondaryCta}
                            <MoveRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    </div>
);
