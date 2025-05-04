// apps/api/src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Response, Request } from 'express';
import { AUTH_COOKIE_NAME } from '../../../common/constants';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );

    if (!result) {
      throw new HttpException('Credenciais inválidas', HttpStatus.UNAUTHORIZED);
    }

    // Configura o cookie HTTP-only seguro
    res.cookie(AUTH_COOKIE_NAME, result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400000, // 1 dia
    });

    return {
      user: result.user,
      // Não retornamos o token no body pois está no cookie
    };
  }

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const result = await this.authService.register(
        dto.name,
        dto.email,
        dto.password,
      );

      // Configura o cookie após registro
      res.cookie(AUTH_COOKIE_NAME, result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 86400000, // 1 dia
      });

      return {
        user: result.user,
        // Não retornamos o token no body pois está no cookie
      };
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('validate-token')
  async validateToken(@Req() req: Request) {
    // Extrai o token do header Authorization ou dos cookies
    const token =
      req.headers.authorization?.split(' ')[1] || req.cookies?.[AUTH_COOKIE_NAME];

    if (!token) {
      throw new HttpException('Token não fornecido', HttpStatus.UNAUTHORIZED);
    }

    try {
      const payload = this.authService.verifyJwt(token);
      return payload;
    } catch (error) {
      throw new HttpException(
        'Token inválido ou expirado',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(AUTH_COOKIE_NAME);
    return { success: true };
  }
}
