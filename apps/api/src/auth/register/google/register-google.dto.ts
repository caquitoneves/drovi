import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../../../common/constants/user-role.enum';

/**
 * DTO para registrar usuários via autenticação Google (sem senha)
 */
export class RegisterGoogleDto {
    @ApiProperty({
        example: 'joao@email.com',
        description: 'Email fornecido pelo Google',
    })
    email: string;

    @ApiProperty({
        example: 'João da Silva',
        description: 'Nome completo do usuário (fornecido pelo Google)',
    })
    name: string;

    @ApiProperty({
        enum: UserRole,
        example: UserRole.BUSINESS,
        description: 'Tipo de usuário: MOTOBOY ou BUSINESS',
    })
    role: UserRole;

    @ApiPropertyOptional({
        example: '12.345.678/0001-99',
        description: 'CNPJ da empresa (caso seja um usuário do tipo BUSINESS)',
    })
    cnpj?: string;

    @ApiPropertyOptional({
        example: 'moto',
        description: 'Tipo de veículo (caso seja um usuário do tipo MOTOBOY)',
    })
    vehicleType?: string;
}
