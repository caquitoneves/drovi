// apps/api/src/auth/auth.controller.ts
import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        const result = await this.authService.login(loginDto.email, loginDto.password);

        if (!result) {
            throw new HttpException('Credenciais inválidas', HttpStatus.UNAUTHORIZED);
        }

        return result;
    }

    @Post('register')
    async register(@Body() dto: RegisterDto) {
        try {
            return await this.authService.register(dto.name, dto.email, dto.password);
        } catch (err) {
            throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
        }
    }
}
