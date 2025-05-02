//apps/api/src/user/user.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
    ) {}

    findAll() {
        return this.userModel.find().select('-passwordHash');
    }

    findOne(id: string) {
        return this.userModel.findById(id).select('-passwordHash');
    }

    findByEmail(email: string) {
        return this.userModel.findOne({ email });
    }

    async create(data: CreateUserDto): Promise<UserDocument> {
        const passwordHash = await bcrypt.hash(data.password, 10);

        const createdUser = new this.userModel({
            email: data.email,
            name: data.name,
            role: data.role,
            passwordHash,
        });

        await createdUser.save();

        // Não delete diretamente, apenas prepare o retorno
        return createdUser;
    }
}
