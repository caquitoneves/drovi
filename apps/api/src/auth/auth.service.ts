//apps/api/src/auth/auth.service.ts

import { Injectable } from '@nestjs/common';
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

    generateJwt(payload: { sub: string; email: string }) {
        return this.jwtService.sign(payload);
    }

    verifyJwt(token: string) {
        return this.jwtService.verify(token);
    }

    async validateUser(email: string, password: string): Promise<UserDocument | null> {
        const user = await this.userService.findByEmail(email);
        if (!user || !user.passwordHash) return null;

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        return isPasswordValid ? user : null;
    }

    async login(email: string, password: string) {
        const user = await this.validateUser(email, password);
        if (!user) return null;

        const token = this.generateJwt({ sub: user._id.toString(), email: user.email });

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

    async register(name: string, email: string, password: string, role: UserRole = UserRole.Business) {
        const existing = await this.userService.findByEmail(email);
        if (existing) {
            throw new Error('E-mail já está em uso');
        }

        const createdUser = await this.userService.create({
            name,
            email,
            password,
            role,
        });

        const token = this.generateJwt({ sub: createdUser._id.toString(), email });

        return {
            user: {
                id: createdUser._id.toString(),
                email: createdUser.email,
                name: createdUser.name,
                role: createdUser.role,
            },
            token,
        };
    }
}
