//import 'server-only';

import type pt from './dictionaries/pt.json';
import languine from './languine.json';

// Idiomas suportados
export const locales = [
    languine.locale.source,
    ...languine.locale.targets,
] as const;

export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = languine.locale.source;

export type Dictionary = typeof pt;

// Map de carregamento dinâmico dos dicionários
const dictionaries: Record<Locale, () => Promise<Dictionary>> = Object.fromEntries(
    locales.map((locale) => [
        locale,
        () =>
            import(`./dictionaries/${locale}.json`)
                .then((mod) => mod.default)
                .catch((err) => {
                    console.error(`Erro ao carregar o dicionário para o idioma "${locale}"`, err);
                    return import('./dictionaries/pt.json').then((mod) => mod.default);
                }),
    ])
) as Record<Locale, () => Promise<Dictionary>>;

// Função principal de obtenção do dicionário
export const getDictionary = async (locale: string): Promise<Dictionary> => {
    const normalized = locale.split('-')[0] as Locale;

    if (!locales.includes(normalized)) {
        console.warn(`Idioma "${locale}" não suportado. Usando fallback: "${defaultLocale}".`);
        return dictionaries[defaultLocale]();
    }

    try {
        return await dictionaries[normalized]();
    } catch (error) {
        console.error(`Erro ao carregar dicionário para "${normalized}", usando fallback "${defaultLocale}".`, error);
        return dictionaries[defaultLocale]();
    }
};
