'use client';

import { usePathname } from 'next/navigation';
import { locales, defaultLocale, type Locale } from '@repo/internationalization';

export function useLocale(): Locale {
  const pathname = usePathname();
  const firstSegment = pathname?.split('/')[1];
  const locale = locales.includes(firstSegment as Locale) ? (firstSegment as Locale) : defaultLocale;
  return locale;
}