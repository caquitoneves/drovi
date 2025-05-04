import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Middleware para parsing de cookies
  app.use(cookieParser());

  // Configuração global de pipes para validação
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades não decoradas nos DTOs
      transform: true, // Transforma tipos automaticamente
      forbidNonWhitelisted: true, // Rejeita requisições com propriedades não permitidas
    }),
  );

  // Configuração global de filtro de exceções
  app.useGlobalFilters(new HttpExceptionFilter());

  // Configuração de CORS para integração com o frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000', // Ajuste para a URL do seu frontend
    credentials: true, // Permite cookies nas requisições
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Inicia a aplicação
  await app.listen(process.env.PORT ?? 3001);
  // Log de inicialização
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
