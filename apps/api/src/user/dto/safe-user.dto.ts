//apps\api\src\user\dto\safe-user.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../../../common/constants/user-role.enum';

/**
 * DTO utilizado para expor dados seguros do usuário, sem informações sensíveis como senha.
 */
export class SafeUserDto {
  @ApiProperty({
    example: '645a0f213b8f1b001e3abcde',
    description: 'ID único do usuário',
  })
  id: string;

  @ApiProperty({
    example: 'João Silva',
    description: 'Nome completo do usuário',
  })
  name: string;

  @ApiProperty({
    example: 'joao@email.com',
    description: 'Endereço de e-mail do usuário',
  })
  email: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.MOTOBOY,
    description: 'Papel ou tipo do usuário na plataforma',
  })
  role: UserRole;

  @ApiPropertyOptional({
    example: '12.345.678/0001-99',
    description: 'CNPJ da empresa (se for do tipo business)',
  })
  cnpj?: string;

  @ApiPropertyOptional({
    example: 'moto',
    description: 'Tipo de veículo (se for do tipo motoboy)',
  })
  vehicleType?: string;
}
