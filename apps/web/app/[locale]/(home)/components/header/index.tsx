//apps/web/app/[locale]/(home)/components/header/index.tsx

'use client';

import { ModeToggle } from '@repo/design-system/components/mode-toggle';
import { Button } from '@repo/design-system/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@repo/design-system/components/ui/navigation-menu';
import { Menu, X, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import type { Dictionary } from '@repo/internationalization';
import Image from 'next/image';
import { LanguageSwitcher } from './language-switcher';
import Logo from '@repo/design-system/components/logo/logo.svg';
import { AnimatePresence, motion } from 'framer-motion';
import {NavTransitionLink} from "@repo/design-system/components/layouts/navigation-link";

type HeaderProps = {
  dictionary: Dictionary;
};

export const Header = ({ dictionary }: HeaderProps) => {
  const navigationItems = [
    { title: dictionary.web.header.howItWorks, href: '/como-funciona' },
    { title: dictionary.web.header.benefits, href: '/vantagens' },
    {
      title: dictionary.web.header.business.title,
      items: [
        { title: dictionary.web.header.business.plans, href: '/empresas/planos' },
        { title: dictionary.web.header.business.integration, href: '/empresas/integracoes' },
        { title: dictionary.web.header.business.scheduling, href: '/empresas/agendamento' },
      ],
    },
    { title: dictionary.web.header.registerStore, href: '/cadastro-loja' },
    { title: 'FAQs', href: '/faq' },
  ];

  const [isOpen, setOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container mx-auto flex min-h-20 items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image src={Logo} alt="Logo" width={40} height={40} className="dark:invert" />
            <p className="whitespace-nowrap text-xl font-semibold text-[#222222] dark:invert">DROVI</p>
          </div>

          {/* Navegação Desktop */}
          <div className="hidden lg:flex items-center justify-center">
            <NavigationMenu>
              <NavigationMenuList className="flex items-center gap-4">
                {navigationItems.map((item) => (
                    <NavigationMenuItem key={item.title}>
                      {item.href ? (
                          <NavigationMenuLink asChild>
                            <Button variant="ghost" asChild className="h-10 px-4 py-2">
                              <Link href={item.href}>{item.title}</Link>
                            </Button>
                          </NavigationMenuLink>
                      ) : (
                          <>
                            <NavigationMenuTrigger
                                className="font-medium text-sm h-10 px-4 py-2 [::after]:hidden"
                                onClick={() =>
                                    setOpenDropdown(openDropdown === item.title ? null : item.title)
                                }
                            >
                              {item.title}
                            </NavigationMenuTrigger>

                            <AnimatePresence>
                              {openDropdown === item.title && (
                                  <motion.div
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -10 }}
                                      transition={{ duration: 0.2 }}
                                      className="absolute left-1/2 top-full z-10 w-max min-w-[250px] -translate-x-1/2 rounded-md border bg-popover p-4 shadow-md"
                                  >
                                    <div className="flex flex-col gap-2">
                                      {item.items?.map((subItem) => (
                                          <NavigationMenuLink
                                              href={subItem.href}
                                              key={subItem.title}
                                              className="rounded px-4 py-2 hover:bg-muted"
                                          >
                                            {subItem.title}
                                          </NavigationMenuLink>
                                      ))}
                                    </div>
                                  </motion.div>
                              )}
                            </AnimatePresence>
                          </>
                      )}
                    </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Ações à direita (Desktop) */}
          <div className="hidden lg:flex items-center gap-4">
            <Button variant="ghost" className="hidden md:inline" asChild>
              <Link href="/contact">{dictionary.web.header.contact}</Link>
            </Button>
            <div className="hidden border-r md:inline h-6" />
            <LanguageSwitcher />
            <ModeToggle />
            <Button variant="ghost" asChild className="hidden md:inline">
              <Link href="/motoboy">{dictionary.web.header.becomeCourier}</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-in">{dictionary.web.header.signIn}</Link>
            </Button>
          </div>

          {/* Ações Mobile */}
          <div className="flex items-center justify-end gap-2 lg:hidden">
            <Button asChild>
              <Link href="/sign-in">{dictionary.web.header.signIn}</Link>
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(!isOpen)}
                className="h-9 w-9"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Menu Mobile */}
        {isOpen && (
            <div className="lg:hidden border-t bg-background px-4 py-6 shadow-lg">
              <div className="flex flex-col gap-4">
                {navigationItems.map((item) => (
                    <div key={item.title} className="flex flex-col gap-1">
                      {item.href ? (
                          <Link
                              href={item.href}
                              className="text-base font-medium text-foreground"
                              onClick={() => setOpen(false)}
                          >
                            {item.title}
                          </Link>
                      ) : (
                          <>
                            <button
                                className="flex items-center justify-between text-base font-semibold text-foreground"
                                onClick={() =>
                                    setOpenDropdown(openDropdown === item.title ? null : item.title)
                                }
                            >
                              {item.title}
                              {openDropdown === item.title ? (
                                  <ChevronUp className="h-4 w-4" />
                              ) : (
                                  <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                            {openDropdown === item.title && (
                                <div className="mt-2 flex flex-col gap-1 pl-4">
                                  {item.items?.map((subItem) => (
                                      <Link
                                          key={subItem.title}
                                          href={subItem.href}
                                          className="text-sm text-muted-foreground hover:underline"
                                          onClick={() => setOpen(false)}
                                      >
                                        {subItem.title}
                                      </Link>
                                  ))}
                                </div>
                            )}
                          </>
                      )}
                    </div>
                ))}
                <div className="mt-4 flex flex-col gap-2 border-t pt-4">
                  <Link href="/contact">
                    <Button variant="ghost" className="w-full justify-start">
                      {dictionary.web.header.contact}
                    </Button>
                  </Link>
                  <Link href="/motoboy">
                    <Button variant="outline" className="w-full justify-start">
                      {dictionary.web.header.becomeCourier}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
        )}
      </header>
  );
};
