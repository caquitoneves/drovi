//apps\api\src\auth\auth.service.ts

import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { User } from '../user/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponseDto } from './dto/response.dto';
import { UserRole } from '../../../common/constants/user-role.enum';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  /**
   * Gera um token JWT para o payload fornecido
   */
  generateJwt(payload: Record<string, any>): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '7d',
    });
  }

  /**
   * Valida um token JWT e retorna o usuário associado
   */
  async validateToken(token: string): Promise<User | null> {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Busca o documento completo, incluindo a hash de senha
      const user = await this.userService.findCompleteUserById(
        decoded.sub,
        true,
      );
      return user;
    } catch (err) {
      return null;
    }
  }

  /**
   * Registra um novo usuário a partir de dados públicos (não técnicos)
   */
  @ApiOperation({
    summary: 'Registro',
    description: 'Registra um novo usuário (público: empresa ou motoboy)',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Registro realizado com sucesso',
    type: RegisterResponseDto,
  })
  @ApiResponse({ status: 401, description: 'E-mail já está em uso' })
  @ApiResponse({ status: 500, description: 'Falha no registro' })
  async register(
    name: string,
    email: string,
    password: string,
    userType: 'business' | 'motoboy',
    additionalData?: { cnpj?: string; vehicleType?: string },
  ): Promise<RegisterResponseDto> {
    try {
      const existingUser = await this.userService.findByEmail(email);
      if (existingUser) {
        throw new UnauthorizedException('E-mail já está em uso');
      }

      const role =
        userType === 'motoboy' ? UserRole.MOTOBOY : UserRole.BUSINESS;

      const createUserPayload = {
        name,
        email,
        password,
        role,
        ...(userType === 'business'
          ? { cnpj: additionalData?.cnpj }
          : { vehicleType: additionalData?.vehicleType }),
      };

      const createdUser = await this.userService.create(createUserPayload);

      const token = this.generateJwt({
        sub: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
        name: createdUser.name,
      });

      const userResponse: RegisterResponseDto['user'] = {
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
        role: createdUser.role,
        ...(userType === 'business'
          ? { cnpj: createdUser.cnpj }
          : { vehicleType: createdUser.vehicleType }),
      };

      return { user: userResponse, token };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException('Falha no registro');
    }
  }
}
