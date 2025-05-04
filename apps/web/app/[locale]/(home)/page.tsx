//apps/web/app/[locale]/(home)/page.tsx

import { getDictionary } from '@repo/internationalization';
import { Hero } from './components/hero/hero';

type HomeProps = {
    params: {
        locale: string;
    };
};

const Home = async ({ params }: HomeProps) => {
    const { locale } = await params;
    const dictionary = await getDictionary(locale);

    return (
        <>
            <Hero dictionary={dictionary} />
        </>
    );
};

export default Home;
