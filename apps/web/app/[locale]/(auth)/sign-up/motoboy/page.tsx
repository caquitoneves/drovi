/* apps/web/app/[locale]/(auth)/sign-up/motoboy/page.tsx */
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Logo from '@repo/design-system/components/logo/logo.svg';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';

// =============================================
// VALIDAÇÕES E MÁSCARAS
// =============================================
const validateCPF = (cpf: string): boolean => {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleaned)) return false;

    let soma = 0;
    for (let i = 1; i <= 9; i++) soma += parseInt(cleaned[i-1]) * (11 - i);
    let resto = (soma * 10) % 11;
    if ([10, 11].includes(resto)) resto = 0;
    if (resto !== parseInt(cleaned[9])) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cleaned[i-1]) * (12 - i);
    resto = (soma * 10) % 11;
    return resto === parseInt(cleaned[10]);
};

const maskCPF = (value: string) => value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1-$2')
    .slice(0, 14);

const maskPhone = (value: string) => value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15);

const maskCEP = (value: string) => value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 9);

const maskCNH = (value: string) => value.replace(/\D/g, '').slice(0, 11);

// =============================================
// COMPONENTES DE CADA PASSO
// =============================================
function StepOne({ onNext, formData, setFormData }: any) {
    const [cpfError, setCpfError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let maskedValue = value;

        if (name === 'cpf') maskedValue = maskCPF(value);
        if (name === 'phone') maskedValue = maskPhone(value);

        setFormData(prev => ({ ...prev, [name]: maskedValue }));

        if (name === 'cpf' && maskedValue.length === 14) {
            setCpfError(validateCPF(maskedValue) ? '' : 'CPF inválido');
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium">Nome completo</label>
                <input
                    name="name"
                    type="text"
                    required
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={formData.name}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label className="block text-sm font-medium">CPF</label>
                <input
                    name="cpf"
                    type="text"
                    required
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={formData.cpf}
                    onChange={handleChange}
                    maxLength={14}
                    placeholder="000.000.000-00"
                />
                {cpfError && <p className="text-red-500 text-xs mt-1">{cpfError}</p>}
                {!cpfError && formData.cpf.length === 14 && (
                    <p className="text-green-500 text-xs mt-1">CPF válido!</p>
                )}
            </div>
            <div>
                <label className="block text-sm font-medium">Celular</label>
                <input
                    name="phone"
                    type="text"
                    required
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={15}
                    placeholder="(00) 00000-0000"
                />
            </div>
            <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                    name="email"
                    type="email"
                    required
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={formData.email}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label className="block text-sm font-medium">Senha</label>
                <input
                    name="password"
                    type="password"
                    required
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={formData.password}
                    onChange={handleChange}
                    minLength={6}
                />
            </div>
            <button
                onClick={onNext}
                className="w-full bg-black text-white py-2 rounded text-sm font-medium"
                disabled={!formData.name || !formData.cpf || !formData.phone || !formData.email || !formData.password || !!cpfError}
            >
                Próximo
            </button>
        </div>
    );
}

function StepTwo({ onNext, onBack, formData }: any) {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [error, setError] = useState('');

    // Simulação de envio de SMS
    const sendVerificationCode = async () => {
        setIsLoading(true);
        setError('');

        try {
            // Substituir por chamada real à API de SMS
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log(`Código enviado para ${formData.phone}`);
            setCountdown(60);
        } catch (err) {
            setError('Falha ao enviar código. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    // Validação do código (mock)
    const verifyCode = () => {
        if (code === '123456') { // Código fixo para demonstração
            onNext();
        } else {
            setError('Código inválido. Tente 123456 para teste.');
        }
    };

    // Contador regressivo
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    return (
        <div className="space-y-6 text-center">
            <div>
                <h3 className="text-lg font-medium">Verificação de Celular</h3>
                <p className="text-sm text-gray-600 mt-2">
                    Enviamos um código de 6 dígitos para<br />
                    <span className="font-semibold">{formData.phone}</span>
                </p>
            </div>

            <div className="space-y-2">
                <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                        setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                        setError('');
                    }}
                    className="w-full border rounded px-4 py-3 text-lg text-center font-mono"
                    maxLength={6}
                    placeholder="______"
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            <div className="flex flex-col gap-3">
                <button
                    onClick={verifyCode}
                    disabled={code.length !== 6}
                    className="w-full bg-black text-white py-2 rounded text-sm font-medium disabled:opacity-50"
                >
                    Verificar Código
                </button>

                <button
                    type="button"
                    onClick={sendVerificationCode}
                    disabled={countdown > 0 || isLoading}
                    className="text-blue-600 text-sm hover:text-blue-800 disabled:text-gray-400"
                >
                    {isLoading ? 'Enviando...' :
                        countdown > 0 ? `Reenviar em ${countdown}s` : 'Reenviar código'}
                </button>

                <button
                    type="button"
                    onClick={onBack}
                    className="text-gray-600 text-sm hover:text-gray-800 mt-4"
                >
                    Voltar e corrigir número
                </button>
            </div>
        </div>
    );
}

function StepThree({ onNext, onBack, formData, setFormData }: any) {
    const [cep, setCep] = useState('');
    const [addressData, setAddressData] = useState({
        state: '',
        city: '',
        street: '',
        complement: '',
        number: ''
    });

    useEffect(() => {
        const fetchAddress = async () => {
            if (cep.length === 9) {
                try {
                    const res = await fetch(`https://viacep.com.br/ws/${cep.replace('-', '')}/json/`);
                    const data = await res.json();
                    if (!data.erro) {
                        setAddressData({
                            state: data.uf || '',
                            city: data.localidade || '',
                            street: data.logradouro || '',
                            complement: data.complemento || '',
                            number: ''
                        });
                        setFormData(prev => ({
                            ...prev,
                            state: data.uf,
                            city: data.localidade,
                            street: data.logradouro,
                            cep: cep.replace('-', '')
                        }));
                    }
                } catch (err) {
                    console.error('Erro ao buscar endereço:', err);
                }
            }
        };
        fetchAddress();
    }, [cep]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = maskCEP(e.target.value);
        setCep(value);
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium">CEP</label>
                <input
                    name="cep"
                    type="text"
                    required
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={cep}
                    onChange={handleCepChange}
                    maxLength={9}
                    placeholder="00000-000"
                />
            </div>
            <div>
                <label className="block text-sm font-medium">Estado</label>
                <input
                    name="state"
                    type="text"
                    value={addressData.state}
                    readOnly
                    className="w-full border rounded px-3 py-2 text-sm bg-gray-100"
                />
            </div>
            <div>
                <label className="block text-sm font-medium">Cidade</label>
                <input
                    name="city"
                    type="text"
                    value={addressData.city}
                    readOnly
                    className="w-full border rounded px-3 py-2 text-sm bg-gray-100"
                />
            </div>
            <div>
                <label className="block text-sm font-medium">Endereço</label>
                <input
                    name="street"
                    type="text"
                    value={addressData.street}
                    readOnly
                    className="w-full border rounded px-3 py-2 text-sm bg-gray-100"
                />
            </div>
            <div className="flex gap-2">
                <div className="flex-1">
                    <label className="block text-sm font-medium">Número</label>
                    <input
                        name="number"
                        type="text"
                        value={formData.number}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2 text-sm"
                        required
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium">Complemento</label>
                    <input
                        name="complement"
                        type="text"
                        value={formData.complement}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2 text-sm"
                    />
                </div>
            </div>
            <div className="flex justify-between gap-2">
                <button onClick={onBack} className="w-1/2 border py-2 rounded text-sm">
                    Voltar
                </button>
                <button
                    onClick={onNext}
                    className="w-1/2 bg-black text-white py-2 rounded text-sm font-medium"
                    disabled={!cep || !formData.number}
                >
                    Próximo
                </button>
            </div>
        </div>
    );
}

function StepFour({ onBack, formData, setFormData }: any) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let maskedValue = name === 'cnh' ? maskCNH(value) : value;
        setFormData(prev => ({ ...prev, [name]: maskedValue }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files?.[0]) setFormData(prev => ({ ...prev, [name]: files[0] }));
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium">Número da CNH</label>
                <input
                    name="cnh"
                    type="text"
                    required
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={formData.cnh}
                    onChange={handleChange}
                    maxLength={11}
                    placeholder="00000000000"
                />
            </div>
            <div>
                <label className="block text-sm font-medium">Foto da CNH</label>
                <input
                    name="cnhPhoto"
                    type="file"
                    accept="image/*"
                    required
                    className="w-full border rounded px-3 py-2 text-sm"
                    onChange={handleFileChange}
                />
            </div>
            <div>
                <label className="block text-sm font-medium">Selfie com CNH</label>
                <input
                    name="selfie"
                    type="file"
                    accept="image/*"
                    required
                    className="w-full border rounded px-3 py-2 text-sm"
                    onChange={handleFileChange}
                />
            </div>
            <div>
                <label className="block text-sm font-medium">Comprovante de residência</label>
                <input
                    name="addressProof"
                    type="file"
                    accept="image/*,.pdf"
                    required
                    className="w-full border rounded px-3 py-2 text-sm"
                    onChange={handleFileChange}
                />
            </div>
            <div className="flex justify-between gap-2">
                <button onClick={onBack} className="w-1/2 border py-2 rounded text-sm">
                    Voltar
                </button>
                <button
                    type="submit"
                    className="w-1/2 bg-black text-white py-2 rounded text-sm font-medium"
                    disabled={!formData.cnh || !formData.cnhPhoto || !formData.selfie || !formData.addressProof}
                >
                    Finalizar Cadastro
                </button>
            </div>
        </div>
    );
}

// =============================================
// COMPONENTE PRINCIPAL
// =============================================
export default function SignUpMotoboyPage() {
    const { locale } = useParams();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        cpf: '',
        phone: '',
        email: '',
        password: '',
        cep: '',
        state: '',
        city: '',
        street: '',
        complement: '',
        number: '',
        cnh: '',
        cnhPhoto: null,
        selfie: null,
        addressProof: null,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step === 4) {
            try {
                // Substituir por chamada real à API
                console.log('Dados enviados:', formData);
                alert('Cadastro concluído com sucesso!');
            } catch (error) {
                console.error('Erro:', error);
                alert('Erro ao enviar. Tente novamente.');
            }
        } else {
            setStep(step + 1);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-[3fr_2fr] bg-gray-100">
            <div className="hidden md:block" />
            <div className="flex items-center justify-center bg-white px-6 py-12">
                <div className="w-full max-w-sm space-y-6">
                    <div>
                        <Image src={Logo} alt="Logotipo" width={40} height={40} className="mb-2" />
                        <h1 className="text-2xl font-bold">Cadastro de Motoboy</h1>
                        <p className="text-sm text-gray-500">Passo {step} de 4</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {step === 1 && <StepOne onNext={() => setStep(2)} formData={formData} setFormData={setFormData} />}
                            {step === 2 && <StepTwo onNext={() => setStep(3)} onBack={() => setStep(1)} formData={formData} />}
                            {step === 3 && <StepThree onNext={() => setStep(4)} onBack={() => setStep(2)} formData={formData} setFormData={setFormData} />}
                            {step === 4 && <StepFour onBack={() => setStep(3)} formData={formData} setFormData={setFormData} />}
                        </motion.div>
                    </form>

                    <p className="text-center text-xs text-gray-400 mt-4">
                        © {new Date().getFullYear()} Drovi. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
}