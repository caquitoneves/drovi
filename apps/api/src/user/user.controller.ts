//apps/api/src/user/user.controller.ts
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from "../auth/dto/create-user.dto";

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    findAll() {
        return this.userService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.userService.findOne(id);
    }

    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }
}
