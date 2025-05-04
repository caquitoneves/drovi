// apps/api/src/app/motoboy.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard'
import { UserRole } from '../user/constants/user-role.enum';
import { Roles } from "../auth/decorators/roles.decorator";

@Controller('motoboy')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MotoboyController {
    @Get('entregas')
    @Roles(UserRole.MOTOBOY)
    getMyDeliveries() {
        return { message: 'Suas entregas atuais.' };
    }
}
