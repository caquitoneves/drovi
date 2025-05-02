import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Conexão com MongoDB via variável de ambiente
    MongooseModule.forRoot(process.env.DATABASE_URL || 'mongodb://localhost:27017/drovi'),

    // Módulos da aplicação
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
