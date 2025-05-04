// apps/api/src/auth/dto/register.dto.ts

import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  ValidateIf,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsString()
  @MinLength(3, { message: 'O nome deve ter pelo menos 3 caracteres' })
  @MaxLength(50, { message: 'O nome não pode exceder 50 caracteres' })
  name: string;

  @IsEmail({}, { message: 'E-mail inválido' })
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsString()
  @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message:
      'A senha deve conter letras maiúsculas, minúsculas, números e símbolos',
  })
  password: string;

  @IsEnum(['business', 'motoboy'], {
    message: 'Tipo de usuário deve ser "business" ou "motoboy"',
  })
  userType: 'business' | 'motoboy';

  @ValidateIf((o) => o.userType === 'business')
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/, {
    message: 'CNPJ inválido (formato: 99.999.999/9999-99)',
  })
  cnpj?: string;

  @ValidateIf((o) => o.userType === 'motoboy')
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Tipo de veículo é obrigatório para motoboys' })
  @MaxLength(20, { message: 'Tipo de veículo não pode exceder 20 caracteres' })
  vehicleType?: string;
}
