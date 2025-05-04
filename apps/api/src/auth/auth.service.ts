//apps/api/src/auth/auth.service.ts
import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '../user/constants/user-role.enum';
import { UserDocument } from '../user/schemas/user.schema';
import {
  LoginResponseDto,
  RegisterResponseDto,
  TokenValidationResponseDto,
  AuthResponseDto,
  UserResponseDto
} from './dto/response.dto';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ValidateTokenDto } from './dto/validate-token.dto';

@ApiTags('Authentication')
@Injectable()
export class AuthService {
  private readonly jwtExpiresIn: string;
  private readonly bcryptSaltRounds: number;

  constructor(
      private readonly jwtService: JwtService,
      private readonly userService: UserService,
      private readonly configService: ConfigService,
  ) {
    this.jwtExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '1d';
    this.bcryptSaltRounds = parseInt(this.configService.get<string>('BCRYPT_SALT_ROUNDS') || '10');
  }

  /**
   * Gera um token JWT assinado
   * @param payload Objeto contendo sub, email, role e name
   * @returns Token JWT assinado
   * @throws InternalServerErrorException se falhar ao gerar token
   */
  @ApiOperation({ summary: 'Gerar token JWT', description: 'Gera um token JWT assinado para autenticação' })
  @ApiResponse({ status: 500, description: 'Falha ao gerar token' })
  private generateJwt(payload: {
    sub: string;
    email: string;
    role: UserRole;
    name: string;
  }): string {
    try {
      return this.jwtService.sign(
          { ...payload, iat: Math.floor(Date.now() / 1000) },
          {
            expiresIn: this.jwtExpiresIn,
            secret: this.configService.get<string>('JWT_SECRET'),
          }
      );
    } catch (error) {
      throw new InternalServerErrorException('Falha ao gerar token');
    }
  }

  /**
   * Verifica e decodifica um token JWT
   * @param token Token JWT a ser verificado
   * @returns Payload do token decodificado
   * @throws UnauthorizedException se o token for inválido ou expirado
   */
  @ApiOperation({ summary: 'Verificar token JWT', description: 'Verifica e decodifica um token JWT' })
  @ApiResponse({ status: 401, description: 'Token inválido ou expirado' })
  private verifyJwt(token: string): TokenValidationResponseDto {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      return {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        name: payload.name,
        iat: payload.iat,
        exp: payload.exp
      };
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }

  /**
   * Valida as credenciais do usuário
   * @param email E-mail do usuário
   * @param password Senha não criptografada
   * @returns UserDocument do usuário se válido, null caso contrário
   * @throws InternalServerErrorException se ocorrer erro na validação
   */
  @ApiOperation({ summary: 'Validar usuário', description: 'Valida as credenciais do usuário' })
  @ApiResponse({ status: 500, description: 'Falha na validação do usuário' })
  async validateUser(email: string, password: string): Promise<UserDocument | null> {
    try {
      const user = await this.userService.findByEmailWithPassword(email);
      if (!user?.passwordHash) return null;

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      return isPasswordValid ? user : null;
    } catch (error) {
      throw new InternalServerErrorException('Falha na validação do usuário');
    }
  }

  /**
   * Realiza o login do usuário
   * @param email E-mail do usuário
   * @param password Senha do usuário
   * @returns LoginResponseDto contendo informações do usuário e token JWT
   * @throws UnauthorizedException se as credenciais forem inválidas
   */
  @ApiOperation({ summary: 'Login', description: 'Realiza o login do usuário' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    type: LoginResponseDto
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(email: string, password: string): Promise<LoginResponseDto> {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const token = this.generateJwt({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    });

    const userResponse: UserResponseDto = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role
    };

    return { user: userResponse, token };
  }

  /**
   * Registra um novo usuário
   * @param name Nome do usuário
   * @param email E-mail do usuário
   * @param password Senha do usuário
   * @param userType Tipo do usuário (business/motoboy)
   * @param additionalData Dados adicionais específicos do tipo de usuário
   * @returns RegisterResponseDto contendo informações do usuário e token JWT
   * @throws UnauthorizedException se o e-mail já estiver em uso
   * @throws InternalServerErrorException se ocorrer falha no registro
   */
  @ApiOperation({ summary: 'Registro', description: 'Registra um novo usuário' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Registro realizado com sucesso',
    type: RegisterResponseDto
  })
  @ApiResponse({ status: 401, description: 'E-mail já está em uso' })
  @ApiResponse({ status: 500, description: 'Falha no registro' })
  async register(
      name: string,
      email: string,
      password: string,
      userType: 'business' | 'motoboy',
      additionalData?: { cnpj?: string; vehicleType?: string }
  ): Promise<RegisterResponseDto> {
    try {
      const existingUser = await this.userService.findByEmail(email);
      if (existingUser) {
        throw new UnauthorizedException('E-mail já está em uso');
      }

      const role = userType === 'motoboy' ? UserRole.MOTOBOY : UserRole.BUSINESS;
      const createdUser = await this.userService.create({
        name,
        email,
        password,
        role,
        ...additionalData
      });

      const token = this.generateJwt({
        sub: createdUser.id,
        email: createdUser.email,
        role,
        name: createdUser.name
      });

      const userResponse: RegisterResponseDto['user'] = {
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
        role: createdUser.role,
        ...additionalData
      };

      return { user: userResponse, token };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException('Falha no registro');
    }
  }

  /**
   * Valida um token JWT
   * @param token Token JWT a ser validado
   * @returns TokenValidationResponseDto contendo informações do token
   * @throws UnauthorizedException se o token for inválido ou o usuário não for encontrado
   */
  @ApiOperation({ summary: 'Validar token', description: 'Valida um token JWT' })
  @ApiBody({ type: ValidateTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Token válido',
    type: TokenValidationResponseDto
  })
  @ApiResponse({ status: 401, description: 'Token inválido ou usuário não encontrado' })
  async validateToken(token: string): Promise<TokenValidationResponseDto> {
    try {
      const payload = this.verifyJwt(token);

      // Usando o findCompleteUserById privado através de acesso temporário
      const user = await (this.userService as any).findCompleteUserById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      return {
        sub: user._id.toString(), // Usando _id pois estamos com o documento completo
        email: user.email,
        role: user.role,
        name: user.name,
        iat: payload.iat,
        exp: payload.exp
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Token inválido');
    }
  }
}