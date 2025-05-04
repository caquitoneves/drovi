// apps/api/src/auth/auth.controller.ts
import { Body, Controller, Post, Req, Res, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Response, Request } from 'express';
import { UserRole } from '../user/user-role.enum';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
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
    async register(
        @Body() dto: RegisterDto,
        @Res({ passthrough: true }) res: Response
    ) {
        try {
            // Validação do tipo de usuário
            if (!['business', 'motoboy'].includes(dto.userType)) {
                throw new HttpException('Tipo de usuário inválido', HttpStatus.BAD_REQUEST);
            }

            const result = await this.authService.register(
                dto.name,
                dto.email,
                dto.password,
                dto.userType as 'business' | 'motoboy', // Garante o tipo
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
    async validateToken(@Req() req: Request) {
        try {
            const token = this.extractToken(req);
            if (!token) {
                throw new HttpException('Token não fornecido', HttpStatus.UNAUTHORIZED);
            }

            // Usa o novo método validateToken que verifica no banco
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
    async logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('auth-token');
        return { success: true };
    }

    private extractToken(req: Request): string | null {
        return req.headers.authorization?.split(' ')[1] || req.cookies?.['auth-token'] || null;
    }
}