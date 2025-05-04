import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '../user/user-role.enum';
import { UserDocument } from '../user/schemas/user.schema';
import {
    LoginResponseDto,
    RegisterResponseDto,
    TokenPayloadDto,
    TokenValidationResponseDto
} from './dto/response.dto';
import { ConfigService } from '@nestjs/config';

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
        this.bcryptSaltRounds = parseInt(this.configService.get<string>('BCRYPT_SALT_ROUNDS')) || 10;
    }

    /**
     * Gera um token JWT assinado
     * @param payload Dados a serem incluídos no token
     * @returns Token JWT assinado
     * @throws InternalServerErrorException se falhar ao gerar token
     */
    generateJwt(payload: TokenPayloadDto): string {
        try {
            return this.jwtService.sign(
                { ...payload, iat: Math.floor(Date.now() / 1000) },
                {
                    expiresIn: this.jwtExpiresIn,
                    secret: this.configService.get<string>('JWT_SECRET'),
                }
            );
        } catch (error) {
            throw new InternalServerErrorException({
                message: 'Falha ao gerar token',
                code: 'TOKEN_GENERATION_FAILED',
            });
        }
    }

    /**
     * Verifica e decodifica um token JWT
     * @param token Token JWT a ser verificado
     * @returns Payload decodificado
     * @throws UnauthorizedException se o token for inválido ou expirado
     */
    verifyJwt(token: string): TokenValidationResponseDto {
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
                exp: payload.exp,
            };
        } catch (error) {
            throw new UnauthorizedException({
                message: 'Token inválido ou expirado',
                code: 'INVALID_TOKEN',
                error: error.message,
            });
        }
    }

    /**
     * Valida as credenciais do usuário
     * @param email E-mail do usuário
     * @param password Senha não criptografada
     * @returns Usuário válido ou null
     * @throws InternalServerErrorException se ocorrer erro na validação
     */
    async validateUser(email: string, password: string): Promise<UserDocument | null> {
        try {
            const user = await this.userService.findByEmail(email, true);
            if (!user?.passwordHash) return null;

            const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
            return isPasswordValid ? user : null;
        } catch (error) {
            throw new InternalServerErrorException({
                message: 'Falha na validação do usuário',
                code: 'USER_VALIDATION_FAILED',
            });
        }
    }

    /**
     * Realiza o login do usuário
     * @param email E-mail do usuário
     * @param password Senha não criptografada
     * @returns Dados do usuário e token JWT
     * @throws UnauthorizedException se as credenciais forem inválidas
     */
    async login(email: string, password: string): Promise<LoginResponseDto> {
        const user = await this.validateUser(email, password);
        if (!user) {
            throw new UnauthorizedException({
                message: 'Credenciais inválidas',
                code: 'INVALID_CREDENTIALS',
            });
        }

        const token = this.generateJwt({
            sub: user._id.toString(),
            email: user.email,
            role: user.role,
            name: user.name,
        });

        return {
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                role: user.role,
            },
            token,
        };
    }

    /**
     * Registra um novo usuário
     * @param name Nome completo
     * @param email E-mail válido
     * @param password Senha forte
     * @param userType Tipo de usuário (business ou motoboy)
     * @param additionalData Dados adicionais específicos por tipo
     * @returns Dados do usuário e token JWT
     * @throws UnauthorizedException se o e-mail já estiver em uso
     */
    async register(
        name: string,
        email: string,
        password: string,
        userType: 'business' | 'motoboy',
        additionalData?: {
            cnpj?: string;
            vehicleType?: string;
        }
    ): Promise<RegisterResponseDto> {
        try {
            const existingUser = await this.userService.findByEmail(email);
            if (existingUser) {
                throw new UnauthorizedException({
                    message: 'E-mail já está em uso',
                    code: 'EMAIL_IN_USE',
                });
            }

            const role = userType === 'motoboy' ? UserRole.Motoboy : UserRole.Business;
            const createdUser = await this.userService.create({
                name,
                email,
                password,
                role,
                ...additionalData,
            });

            const token = this.generateJwt({
                sub: createdUser._id.toString(),
                email: createdUser.email,
                role,
                name: createdUser.name,
            });

            return {
                user: {
                    id: createdUser._id.toString(),
                    email: createdUser.email,
                    name: createdUser.name,
                    role: createdUser.role,
                    ...additionalData,
                },
                token,
            };
        } catch (error) {
            if (error instanceof UnauthorizedException) throw error;
            throw new InternalServerErrorException({
                message: 'Falha no registro do usuário',
                code: 'REGISTRATION_FAILED',
            });
        }
    }

    /**
     * Valida um token JWT e retorna os dados do usuário
     * @param token Token JWT
     * @returns Dados do usuário associado ao token
     * @throws UnauthorizedException se o token ou usuário forem inválidos
     */
    async validateToken(token: string): Promise<TokenValidationResponseDto> {
        try {
            const payload = this.verifyJwt(token);
            const user = await this.userService.findById(payload.sub);

            if (!user) {
                throw new UnauthorizedException({
                    message: 'Usuário não encontrado',
                    code: 'USER_NOT_FOUND',
                });
            }

            return {
                sub: user._id.toString(),
                email: user.email,
                role: user.role,
                name: user.name,
                iat: payload.iat,
                exp: payload.exp,
            };
        } catch (error) {
            if (error instanceof UnauthorizedException) throw error;
            throw new UnauthorizedException({
                message: 'Token inválido',
                code: 'INVALID_TOKEN',
            });
        }
    }
}