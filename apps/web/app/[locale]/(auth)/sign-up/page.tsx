//apps\web\app\[locale]\(auth)\sign-up\page.tsx

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Logo from '@repo/design-system/components/logo/logo.svg';

export default function SignUpChoicePage() {
  const params = useParams();
  const router = useRouter();
  const locale = typeof params.locale === 'string' ? params.locale : 'pt';

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[3fr_2fr] bg-gray-100">
      <div className="hidden md:block" />

      <div className="flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-left">
            <Image src={Logo} alt="Logo" width={180} height={60} className="dark:invert mb-2" />
            <h1 className="text-2xl font-bold">Como você deseja se cadastrar?</h1>
            <p className="text-sm text-gray-500">Escolha a opção que melhor representa você</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => router.push(`/${locale}/sign-up/motoboy`)}
              className="w-full border py-3 rounded text-sm font-medium hover:bg-gray-50"
            >
              Sou Motoboy
            </button>

            <button
              onClick={() => router.push(`/${locale}/sign-up/business`)}
              className="w-full border py-3 rounded text-sm font-medium hover:bg-gray-50"
            >
              Sou Empresa
            </button>
          </div>

          <p className="text-center text-sm">
            Já tem conta?{' '}
            <Link href={`/${locale}/sign-in`} className="text-blue-600 hover:underline">
              Entrar
            </Link>
          </p>

          <p className="text-center text-xs text-gray-400 mt-4">
            © 2025 Drovi. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
