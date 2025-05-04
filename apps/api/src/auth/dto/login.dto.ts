//apps/api/src/auth/dto/login.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
    @ApiProperty({
        example: 'usuario@empresa.com',
        description: 'Endereço de e-mail cadastrado',
        required: true,
        type: String,
        maxLength: 254,
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
    })
    @IsEmail(
        {},
        {
            message: 'O e-mail deve ser um endereço válido',
        }
    )
    @MaxLength(254, {
        message: 'O e-mail não pode ter mais que 254 caracteres',
    })
    @Transform(({ value }) => value.toLowerCase().trim())
    email: string;

    @ApiProperty({
        example: 'Senha@123',
        description: 'Senha de acesso (mínimo 8 caracteres)',
        required: true,
        type: String,
        minLength: 8,
        maxLength: 128,
        pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).+$'
    })
    @IsNotEmpty({
        message: 'A senha é obrigatória',
    })
    @IsString({
        message: 'A senha deve ser uma string',
    })
    @MinLength(8, {
        message: 'A senha deve ter no mínimo 8 caracteres',
    })
    @MaxLength(128, {
        message: 'A senha não pode ter mais que 128 caracteres',
    })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
        message:
            'A senha deve conter pelo menos: 1 letra maiúscula, 1 minúscula, 1 número e 1 caractere especial',
    })
    password: string;
}