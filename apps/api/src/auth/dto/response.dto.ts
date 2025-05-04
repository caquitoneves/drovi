//apps/api/src/auth/dto/response.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../roles.enum';

export class UserResponseDto {
    @ApiProperty({
        example: '507f1f77bcf86cd799439011',
        description: 'ID único do usuário no banco de dados'
    })
    id: string;

    @ApiProperty({
        example: 'user@example.com',
        description: 'E-mail cadastrado',
        maxLength: 254
    })
    email: string;

    @ApiProperty({
        example: 'Nome Completo',
        description: 'Nome de exibição do usuário',
        minLength: 3,
        maxLength: 100
    })
    name: string;

    @ApiProperty({
        enum: UserRole,
        example: UserRole.Business,
        description: 'Tipo de perfil do usuário'
    })
    role: UserRole;
}

export class TokenValidationResponseDto {
    @ApiProperty({
        example: '507f1f77bcf86cd799439011',
        description: 'ID do usuário (sub)'
    })
    sub: string;

    @ApiProperty({
        example: 'user@example.com',
        description: 'E-mail do usuário'
    })
    email: string;

    @ApiProperty({
        enum: UserRole,
        example: UserRole.Business,
        description: 'Perfil do usuário'
    })
    role: UserRole;

    @ApiProperty({
        example: 'Nome Completo',
        description: 'Nome do usuário'
    })
    name: string;

    @ApiProperty({
        example: 1672531200,
        description: 'Timestamp de quando o token foi emitido (iat)'
    })
    iat: number;

    @ApiProperty({
        example: 1672617600,
        description: 'Timestamp de expiração do token (exp)'
    })
    exp: number;
}

export class AuthResponseDto extends UserResponseDto {
    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'Token JWT para autenticação'
    })
    token: string;
}

export class RegisterResponseDto extends AuthResponseDto {
    @ApiProperty({
        example: '00.000.000/0001-00',
        description: 'CNPJ da empresa (apenas para role business)',
        required: false
    })
    cnpj?: string;

    @ApiProperty({
        example: 'moto',
        description: 'Tipo de veículo (apenas para role motoboy)',
        required: false,
        enum: ['moto', 'carro', 'bicicleta']
    })
    vehicleType?: string;
}