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

  generateJwt(payload: { sub: string; email: string; role?: UserRole }) {
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

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = await this.userService.findByEmail(email, true); // Certifique-se que o método findByEmail inclui o passwordHash
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
      role: user.role, // Adicionado role ao token
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

  async register(
    name: string,
    email: string,
    password: string,
    role: UserRole = UserRole.Business,
  ) {
    const existing = await this.userService.findByEmail(email);
    if (existing) {
      throw new UnauthorizedException('E-mail já está em uso');
    }

    const createdUser = await this.userService.create({
      name,
      email,
      password,
      role,
    });

    const token = this.generateJwt({
      sub: createdUser._id.toString(),
      email,
      role: createdUser.role,
    });

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
