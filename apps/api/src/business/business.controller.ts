// apps/api/src/app/business.controller.ts
import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/roles.enum';

@Controller('business')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BusinessController {
    @Post('delivery-request')
    @Roles(UserRole.Business)
    createDelivery() {
        return { message: 'Entrega criada com sucesso.' };
    }
}
