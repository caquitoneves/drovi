import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../constants/user-role.enum';

/**
 * DTO utilizado para expor dados seguros do usuário, sem informações sensíveis como senha.
 */
export class SafeUserDto {
    @ApiProperty({ example: '645a0f213b8f1b001e3abcde', description: 'ID único do usuário' })
    id: string;

    @ApiProperty({ example: 'João Silva', description: 'Nome completo do usuário' })
    name: string;

    @ApiProperty({ example: 'joao@email.com', description: 'Endereço de e-mail do usuário' })
    email: string;

    @ApiProperty({ enum: UserRole, example: UserRole.MOTOBOY, description: 'Papel ou tipo do usuário na plataforma' })
    role: UserRole;
}
