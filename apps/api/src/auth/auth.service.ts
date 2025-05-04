// apps/api/src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '../user/user-role.enum';
import { UserDocument } from '../user/schemas/user.schema';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private userService: UserService,
    ) {}


    generateJwt(payload: { sub: string; email: string; role: UserRole }) {
        return this.jwtService.sign(payload, {
            expiresIn: '1d',
        });
    }


    verifyJwt(token: string) {
        try {
            return this.jwtService.verify(token);
        } catch (error) {
            throw new UnauthorizedException('Token inválido ou expirado');
        }
    }


    async validateUser(email: string, password: string): Promise<UserDocument | null> {
        const user = await this.userService.findByEmail(email, true);
        if (!user || !user.passwordHash) return null;

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        return isPasswordValid ? user : null;
    }


    async login(email: string, password: string) {
        const user = await this.validateUser(email, password);
        if (!user) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        const token = this.generateJwt({
            sub: user._id.toString(),
            email: user.email,
            role: user.role
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

    // Metodo REFATORADO para cadastro específico
    async register(
        name: string,
        email: string,
        password: string,
        userType: 'business' | 'motoboy', // Novo parâmetro obrigatório
        additionalData?: { // Dados adicionais específicos por tipo
            cnpj?: string;       // Para business
            vehicleType?: string // Para motoboy
        }
    ) {
        const existing = await this.userService.findByEmail(email);
        if (existing) {
            throw new UnauthorizedException('E-mail já está em uso');
        }

        // Determina a role baseada no userType
        const role = userType === 'motoboy'
            ? UserRole.Motoboy
            : UserRole.Business;

        const createdUser = await this.userService.create({
            name,
            email,
            password,
            role,
            ...additionalData // Adiciona campos específicos
        });

        const token = this.generateJwt({
            sub: createdUser._id.toString(),
            email,
            role
        });

        return {
            user: {
                id: createdUser._id.toString(),
                email: createdUser.email,
                name: createdUser.name,
                role: createdUser.role,
                ...additionalData // Retorna dados específicos no payload
            },
            token,
        };
    }

    // Metodo para validação de token (usado pelo middleware)
    async validateToken(token: string) {
        try {
            const payload = this.verifyJwt(token);
            const user = await this.userService.findById(payload.sub);

            if (!user) {
                throw new UnauthorizedException('Usuário não encontrado');
            }

            return {
                sub: user._id.toString(),
                email: user.email,
                role: user.role,
                name: user.name
            };
        } catch (error) {
            throw new UnauthorizedException('Token inválido');
        }
    }
}