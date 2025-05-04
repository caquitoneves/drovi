export class RegisterDto {
    name: string;
    email: string;
    password: string;
    role?: string; // Opcional, com valor padrão no service
}