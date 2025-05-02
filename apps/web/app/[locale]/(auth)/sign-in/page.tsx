'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import { FaApple, FaMicrosoft } from 'react-icons/fa';
import Logo from '@repo/design-system/components/logo/logo.svg';
import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';

export default function SignInPage() {
    const params = useParams();
    const router = useRouter();
    const locale = typeof params.locale === 'string' ? params.locale : 'pt';

    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        const res = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        if (res?.ok) {
            router.push(`/${locale}`);
        } else {
            setError('Email ou senha inválidos');
        }
    }

    async function handleSocialLogin(provider: 'google' | 'apple' | 'microsoft') {
        await signIn(provider, {
            callbackUrl: `/${locale}`,
        });
    }

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-[3fr_2fr] bg-gray-100">
            <div className="hidden md:block" />

            <div className="flex items-center justify-center bg-white px-6 py-12">
                <div className="w-full max-w-sm space-y-6">
                    <div className="text-left">
                        <Image src={Logo} alt="Logotipo da Drovi" width={40} height={40} className="mb-2" />
                        <h1 className="text-2xl font-bold">Bom te ver de novo!</h1>
                        <p className="text-sm text-gray-500">Faça login para continuar</p>
                    </div>

                    <form className="space-y-3" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Email"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium">Senha</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Senha"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            />
                        </div>

                        {error && <p className="text-sm text-red-500">{error}</p>}

                        <div className="text-right text-sm">
                            <Link href={`/${locale}/forgot-password`} className="text-blue-600 hover:underline">
                                Esqueceu sua senha?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-black text-white py-2 rounded text-sm font-medium"
                        >
                            Entrar
                        </button>
                    </form>

                    <div className="text-center text-sm text-gray-500">ou</div>

                    <div className="space-y-2">
                        <button
                            onClick={() => handleSocialLogin('google')}
                            className="w-full border py-2 rounded flex items-center justify-center gap-2 text-sm hover:bg-gray-50"
                        >
                            <FcGoogle className="text-lg" />
                            Entrar com Google
                        </button>

                        <button
                            onClick={() => handleSocialLogin('apple')}
                            className="w-full border py-2 rounded flex items-center justify-center gap-2 text-sm hover:bg-gray-50"
                        >
                            <FaApple className="text-lg" />
                            Entrar com Apple
                        </button>

                        <button
                            onClick={() => handleSocialLogin('microsoft')}
                            className="w-full border py-2 rounded flex items-center justify-center gap-2 text-sm hover:bg-gray-50"
                        >
                            <FaMicrosoft className="text-lg" />
                            Entrar com Microsoft
                        </button>
                    </div>

                    <p className="text-center text-sm">
                        Não tem conta?{' '}
                        <Link href={`/${locale}/sign-up`} className="text-blue-600 hover:underline">
                            Cadastre-se agora
                        </Link>
                    </p>

                    <p className="text-center text-xs text-gray-400 mt-4">
                        © 2025 Motocoop. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
}
