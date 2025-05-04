import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsBoolean,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsEmail,
  ValidateIf,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../../common/constants/user-role.enum';

/**
 * DTO para criação técnica de usuários (uso interno/admin)
 * @description Contém campos técnicos não expostos no registro público
 */
export class CreateUserDto {
  @ApiProperty({
    enum: UserRole,
    description: 'Papel técnico no sistema (admin, motoboy ou empresa)',
    example: UserRole.ADMIN,
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    description: 'Endereço de email do usuário',
    example: 'usuario@exemplo.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Senha de acesso (criptografada antes de salvar)',
    example: 'senhaSegura123',
  })
  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  password: string;

  @ApiPropertyOptional({
    description: 'ID de integração externa (ex: ID do Auth0 ou Firebase)',
    example: 'auth0|123456789',
  })
  @IsOptional()
  @IsString()
  externalId?: string;

  @ApiPropertyOptional({
    description: 'Define se o usuário está ativo ou não',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Justificativa técnica para criação (registro de auditoria)',
    example: 'Migração de dados 2024',
  })
  @IsOptional()
  @IsString()
  creationReason?: string;

  @ApiPropertyOptional({
    description:
      'Nome completo do usuário (obrigatório para motoboy e empresa)',
    example: 'João da Silva',
  })
  @ValidateIf((o) => [UserRole.MOTOBOY, UserRole.BUSINESS].includes(o.role))
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({
    description:
      'CNPJ da empresa (obrigatório para usuários do tipo "business")',
    example: '12.345.678/0001-99',
  })
  @ValidateIf((o) => o.role === UserRole.BUSINESS)
  @IsString()
  @IsNotEmpty()
  cnpj?: string;

  @ApiPropertyOptional({
    description: 'Tipo de veículo (obrigatório para motoboys)',
    example: 'moto',
  })
  @ValidateIf((o) => o.role === UserRole.MOTOBOY)
  @IsString()
  @IsNotEmpty()
  vehicleType?: string;
}
