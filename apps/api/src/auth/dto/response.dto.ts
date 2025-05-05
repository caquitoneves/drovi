//apps/api/src/auth/dto/response.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/constants/user-role.enum';

/**
 * DTO para payload do token JWT
 * Contém as informações básicas do usuário que são embutidas no token
 */
export class TokenPayloadDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'ID do usuário (subject)',
  })
  sub: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'E-mail do usuário',
  })
  email: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.BUSINESS,
    description: 'Perfil do usuário',
  })
  role: UserRole;

  @ApiProperty({
    example: 'Nome Completo',
    description: 'Nome do usuário',
  })
  name: string;
}

/**
 * DTO básico de resposta para informações do usuário
 * Usado como base para outras respostas que precisam incluir dados do usuário
 */
export class UserResponseDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'ID único do usuário no banco de dados',
  })
  id: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'E-mail cadastrado',
    maxLength: 254,
  })
  email: string;

  @ApiProperty({
    example: 'Nome Completo',
    description: 'Nome de exibição do usuário',
    minLength: 3,
    maxLength: 100,
  })
  name: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.BUSINESS,
    description: 'Tipo de perfil do usuário',
  })
  role: UserRole;

  // NOTA: Alterado de UserResponseDto para string para evitar recursão infinita
  @ApiProperty({
    type: String,
    description: 'ID do usuário associado (opcional)',
    required: false,
  })
  userId?: string;
}

/**
 * DTO para resposta de login
 * Combina informações do usuário com o token JWT gerado
 */
export class LoginResponseDto {
  @ApiProperty({
    type: UserResponseDto,
    description: 'Dados do usuário autenticado',
  })
  user: UserResponseDto;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token JWT para autenticação',
  })
  token: string;
}

/**
 * DTO para resposta de validação de token
 * Estende TokenPayloadDto com informações adicionais do token JWT
 */
export class TokenValidationResponseDto extends TokenPayloadDto {
  @ApiProperty({
    example: 1672531200,
    description: 'Timestamp de quando o token foi emitido (iat)',
  })
  iat: number;

  @ApiProperty({
    example: 1672617600,
    description: 'Timestamp de expiração do token (exp)',
  })
  exp: number;
}

/**
 * DTO genérico para respostas de autenticação
 * Pode ser usado como base para outras respostas de auth
 */
export class AuthResponseDto {
  @ApiProperty({
    type: UserResponseDto,
    description: 'Dados do usuário',
  })
  user: UserResponseDto;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token JWT para autenticação',
  })
  token: string;
}

/**
 * DTO para resposta de registro de usuário
 * Inclui campos específicos para diferentes tipos de registro (business, motoboy)
 */
export class RegisterResponseDto extends AuthResponseDto {
  // Campo opcional para usuários do tipo business
  @ApiProperty({
    example: '00.000.000/0001-00',
    description: 'CNPJ da empresa (apenas para role business)',
    required: false,
  })
  cnpj?: string;

  // Campo opcional para usuários do tipo motoboy
  @ApiProperty({
    example: 'moto',
    description: 'Tipo de veículo (apenas para role motoboy)',
    required: false,
    enum: ['moto', 'carro', 'bicicleta'],
  })
  vehicleType?: string;
}
