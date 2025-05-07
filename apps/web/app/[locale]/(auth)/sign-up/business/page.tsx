'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Logo from '@repo/design-system/components/logo/logo.svg';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';

// Validação CNPJ
const validateCNPJ = (cnpj: string): boolean => {
    const cleaned = cnpj.replace(/\D/g, '');
    if (cleaned.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cleaned)) return false;

    let tamanho = cleaned.length - 2;
    let numeros = cleaned.substring(0, tamanho);
    const digitos = cleaned.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;

    tamanho += 1;
    numeros = cleaned.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    return resultado === parseInt(digitos.charAt(1));
};

// Máscaras
const maskCNPJ = (value: string) => value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18);

const maskPhone = (value: string) => value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15);

const maskCEP = (value: string) => value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 9);

function StepOne({ onNext, formData, setFormData }: any) {
    const [cnpjError, setCnpjError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let maskedValue = value;

        if (name === 'cnpj') maskedValue = maskCNPJ(value);
        if (name === 'phone') maskedValue = maskPhone(value);

        setFormData(prev => ({ ...prev, [name]: maskedValue }));

        if (name === 'cnpj' && maskedValue.length === 18) {
            setCnpjError(validateCNPJ(maskedValue) ? '' : 'CNPJ inválido');
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium">Nome da Empresa</label>
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
                <label className="block text-sm font-medium">CNPJ</label>
                <input
                    name="cnpj"
                    type="text"
                    required
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={formData.cnpj}
                    onChange={handleChange}
                    maxLength={18}
                    placeholder="00.000.000/0000-00"
                />
                {cnpjError && <p className="text-red-500 text-xs mt-1">{cnpjError}</p>}
                {!cnpjError && formData.cnpj.length === 18 && (
                    <p className="text-green-500 text-xs mt-1">CNPJ válido!</p>
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
                disabled={!formData.name || !formData.cnpj || !formData.phone || !formData.email || !formData.password || !!cnpjError}
            >
                Próximo
            </button>
        </div>
    );
}

function StepTwo({ onNext, onBack, formData, setFormData }: any) {
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
                        setFormData((prev: any) => ({
                            ...prev,
                            state: data.uf,
                            city: data.localidade,
                            street: data.logradouro,
                            cep: cep.replace('-', '')
                        }));
                    } else {
                        alert('CEP não encontrado!');
                    }
                } catch (err) {
                    console.error('Erro ao buscar endereço:', err);
                    alert('Erro ao buscar endereço!');
                }
            }
        };
        fetchAddress();
    }, [cep]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData: any) => ({ ...prevData, [name]: value }));
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

function StepThree({ onBack, formData, setFormData }: any) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files && files.length > 0) {
            setFormData((prevData: any) => ({ ...prevData, [name]: files[0] }));
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium">Comprovante de CNPJ</label>
                <input
                    name="cnpjProof"
                    type="file"
                    accept="image/*,.pdf"
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
            <div className="flex gap-2">
                <button onClick={onBack} className="w-1/2 border py-2 rounded text-sm">
                    Voltar
                </button>
                <button
                    type="submit"
                    className="w-1/2 bg-black text-white py-2 rounded text-sm font-medium"
                    disabled={!formData.cnpjProof || !formData.addressProof}
                >
                    Finalizar Cadastro
                </button>
            </div>
        </div>
    );
}

export default function SignUpBusinessPage() {
    const { locale } = useParams();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        cnpj: '',
        phone: '',
        email: '',
        password: '',
        cep: '',
        state: '',
        city: '',
        street: '',
        complement: '',
        number: '',
        cnpjProof: null,
        addressProof: null
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        if (step === 3) {
            try {
                const data = new FormData();
    
                // Campos normais
                data.append('name', formData.name);
                data.append('cnpj', formData.cnpj.replace(/\D/g, ''));
                data.append('phone', formData.phone.replace(/\D/g, ''));
                data.append('email', formData.email);
                data.append('password', formData.password);
                data.append('cep', formData.cep.replace('-', ''));
                data.append('state', formData.state);
                data.append('city', formData.city);
                data.append('street', formData.street);
                data.append('number', formData.number);
                data.append('complement', formData.complement);
    
                // Arquivos
                if (formData.cnpjProof) data.append('cnpjProof', formData.cnpjProof);
                if (formData.addressProof) data.append('addressProof', formData.addressProof);
    
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
                    method: 'POST',
                    body: data,
                });
    
                if (!res.ok) throw new Error('Erro ao cadastrar');
    
                const result = await res.json();
                console.log('Cadastro realizado:', result);
                alert('Cadastro enviado com sucesso!');
            } catch (error) {
                console.error('Erro ao enviar cadastro:', error);
                alert('Erro ao enviar cadastro. Tente novamente.');
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
                        <Image src={Logo} alt="Logo" width={180} height={60} className="dark:invert mb-2" />
                        <h1 className="text-2xl font-bold">Cadastro de Empresa</h1>
                        <p className="text-sm text-gray-500">Passo {step} de 3</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {step === 1 && <StepOne onNext={() => setStep(2)} formData={formData} setFormData={setFormData} />}
                            {step === 2 && <StepTwo onNext={() => setStep(3)} onBack={() => setStep(1)} formData={formData} setFormData={setFormData} />}
                            {step === 3 && <StepThree onBack={() => setStep(2)} formData={formData} setFormData={setFormData} />}
                        </motion.div>
                    </form>
                    <p className="text-center text-xs text-gray-400 mt-4">© 2025 Drovi. Todos os direitos reservados.</p>
                </div>
            </div>
        </div>
    );
}