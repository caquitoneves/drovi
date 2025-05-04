// apps/api/src/auth/auth.controller.ts
import { Body, Controller, Post, Req, Res, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Response, Request } from 'express';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiCookieAuth,
    ApiBearerAuth,
    ApiExtraModels,
    ApiCreatedResponse
} from '@nestjs/swagger';
import { UserResponseDto, TokenValidationResponseDto } from './dto/response.dto';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @ApiOperation({
        summary: 'Login de usuário',
        description: 'Autentica usuários (business ou motoboy) e retorna cookie HTTP-only'
    })
    @ApiBody({ type: LoginDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Login bem-sucedido',
        type: UserResponseDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Credenciais inválidas'
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados inválidos'
    })
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) res: Response
    ) {
        try {
            const result = await this.authService.login(loginDto.email, loginDto.password);

            res.cookie('auth-token', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 86400000 // 1 dia
            });

            return {
                user: result.user
            };
        } catch (error) {
            throw new HttpException(
                error.message || 'Falha no login',
                error.status || HttpStatus.UNAUTHORIZED
            );
        }
    }

    @Post('register')
    @ApiOperation({
        summary: 'Registro de usuário',
        description: 'Cria nova conta de business ou motoboy'
    })
    @ApiBody({ type: RegisterDto })
    @ApiCreatedResponse({
        description: 'Registro bem-sucedido',
        type: UserResponseDto
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados inválidos ou e-mail em uso'
    })
    @ApiResponse({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        description: 'Erro de validação'
    })
    async register(
        @Body() dto: RegisterDto,
        @Res({ passthrough: true }) res: Response
    ) {
        try {
            if (!['business', 'motoboy'].includes(dto.userType)) {
                throw new HttpException('Tipo de usuário inválido', HttpStatus.BAD_REQUEST);
            }

            const result = await this.authService.register(
                dto.name,
                dto.email,
                dto.password,
                dto.userType as 'business' | 'motoboy',
                {
                    cnpj: dto.cnpj,
                    vehicleType: dto.vehicleType
                }
            );

            res.cookie('auth-token', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 86400000
            });

            return {
                user: result.user
            };
        } catch (error) {
            throw new HttpException(
                error.message || 'Falha no registro',
                error.status || HttpStatus.BAD_REQUEST
            );
        }
    }

    @Post('validate-token')
    @ApiOperation({
        summary: 'Validação de token',
        description: 'Verifica se o token JWT/cookie é válido'
    })
    @ApiBearerAuth()
    @ApiCookieAuth('auth-token')
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Token válido',
        type: TokenValidationResponseDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Token inválido ou expirado'
    })
    async validateToken(@Req() req: Request) {
        try {
            const token = this.extractToken(req);
            if (!token) {
                throw new HttpException('Token não fornecido', HttpStatus.UNAUTHORIZED);
            }

            const userData = await this.authService.validateToken(token);
            return userData;
        } catch (error) {
            throw new HttpException(
                error.message || 'Token inválido',
                error.status || HttpStatus.UNAUTHORIZED
            );
        }
    }

    @Post('logout')
    @ApiOperation({ summary: 'Logout', description: 'Remove o cookie de autenticação' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Logout bem-sucedido',
        schema: { example: { success: true } }
    })
    async logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('auth-token');
        return { success: true };
    }

    private extractToken(req: Request): string | null {
        return req.headers.authorization?.split(' ')[1] || req.cookies?.['auth-token'] || null;
    }
}