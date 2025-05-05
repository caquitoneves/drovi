//apps/web/app/[locale]/(home)/page.tsx

import { getDictionary } from '@repo/internationalization';
import { Hero } from '../(home)/components/hero/hero';
import { MotionDiv  } from '@repo/design-system/components/layouts/motion-div';

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
            <MotionDiv >
                <Hero dictionary={dictionary} />
            </MotionDiv >
        </>
    );
};

export default Home;
