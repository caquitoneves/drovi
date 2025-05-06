import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsEmail,
  ValidateIf,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '../../../common/constants/user-role.enum';
import { City } from '../../../common/constants/city.enum';
import { State } from '../../../common/constants/state.enum';

export class CreateUserDto {
  @ApiProperty({
    example: 'João da Silva',
    description: 'Nome completo do usuário',
  })
  @IsString()
  @MinLength(3, { message: 'O nome deve ter pelo menos 3 caracteres' })
  @MaxLength(50, { message: 'O nome não pode exceder 50 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Endereço de email do usuário',
    example: 'usuario@exemplo.com',
  })
  @IsEmail({}, { message: 'E-mail inválido' })
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty({
    description: 'Senha de acesso',
    example: 'senhaSegura123',
  })
  @IsString()
  @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message:
      'A senha deve conter letras maiúsculas, minúsculas, números e símbolos',
  })
  password: string;

  @ApiProperty({
    enum: UserRole,
    description: 'Papel técnico no sistema (admin, motoboy ou empresa)',
    example: UserRole.ADMIN,
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({
    description: 'Justificativa técnica para criação (registro de auditoria)',
    example: 'Migração de dados 2024',
  })
  @IsOptional()
  @IsString()
  creationReason?: string;

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
    description: 'CPF do usuário (obrigatório para motoboys)',
    example: '000.000.000-00',
  })
  @ValidateIf((o) => o.role === UserRole.MOTOBOY)
  @IsString()
  @IsNotEmpty()
  cpf?: string;

  @ApiPropertyOptional({
    description: 'Número da CNH do usuário ',
    example: '12345678901',
  })
  @ValidateIf((o) => o.role === UserRole.MOTOBOY)
  @IsString()
  @IsNotEmpty()
  cnh?: string;

  @ApiProperty({
    enum: City,
    description: 'Cidade de atuação',
    example: City.PALHOCA,
  })
  @ValidateIf(
    (o) => o.role === UserRole.MOTOBOY || o.role === UserRole.BUSINESS,
  )
  @IsEnum(City)
  city?: City;

  @ApiPropertyOptional({
    description: 'CEP do usuário ',
    example: '00000-000',
  })
  @ValidateIf((o) => o.role === UserRole.BUSINESS)
  @IsString()
  @IsNotEmpty()
  cep?: string;

  @ApiPropertyOptional({
    description: 'Estado do usuário (obrigatório para motoboys)',
    example: 'Estado',
  })
  @ApiProperty({
    enum: State,
    description: 'Estado de atuação',
    example: State.SC,
  })
  @ValidateIf((o) => o.role === UserRole.BUSINESS)
  @IsEnum(State)
  state?: State;

  @ApiPropertyOptional({
    description: 'Endereço do usuário (obrigatório para motoboys)',
    example: 'Endereço',
  })
  @ValidateIf((o) => o.role === UserRole.BUSINESS)
  @IsString()
  @IsNotEmpty()
  street?: string;

  @ApiPropertyOptional({
    description:
      'Complemento do endereço do usuário (obrigatório para motoboys)',
    example: 'Complemento',
  })
  @ValidateIf((o) => o.role === UserRole.BUSINESS)
  @IsString()
  complement?: string;

  @ApiPropertyOptional({
    description: 'Número do endereço do usuário (obrigatório para motoboys)',
    example: '123',
  })
  @ValidateIf((o) => o.role === UserRole.BUSINESS)
  @IsString()
  @IsNotEmpty()
  number?: string;
}
