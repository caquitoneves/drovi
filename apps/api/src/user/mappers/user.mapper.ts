// apps/api/src/user/user.mapper.ts

import { SafeUserDto } from '../dto/safe-user.dto';
import { UserDocument } from '../schemas/user.schema';
import { UserRole } from '../../../common/constants/user-role.enum';

/**
 * Mapeia um UserDocument (ou parcial) para o DTO seguro usado nas respostas da API
 * @param user - Documento do usuário retornado do MongoDB
 * @returns DTO seguro para exposição pública
 */
export function toSafeUserDto(user: Partial<UserDocument>): SafeUserDto {
    if (!user._id || !user.email || !user.name || !user.role) {
        throw new Error('Usuário inválido para conversão em SafeUserDto');
    }

    return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
    };
}
