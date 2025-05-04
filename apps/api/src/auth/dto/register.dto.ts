//apps/api/src/auth/dto/register.dto.ts

export class RegisterDto {
    name: string;
    email: string;
    password: string;
    userType: 'business' | 'motoboy';
    cnpj?: string;          // Opcional para business
    vehicleType?: string;    // Opcional para motoboy
}