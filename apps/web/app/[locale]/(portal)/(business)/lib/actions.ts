//apps/web/app/[locale]/(portal)/(business)/lib/actions.ts
'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../../web/app/api/auth/[...nextauth]/route';


export async function fetchBusinessMetrics() {
    const session = await getServerSession(authOptions);

    const res = await fetch(`${process.env.API_URL}/dashboard/business`, {
        headers: {
            Authorization: `Bearer ${session?.accessToken}`
        }
    });

    return res.json();
}