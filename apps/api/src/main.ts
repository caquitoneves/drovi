import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe, HttpStatus, HttpException } from '@nestjs/common';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { json, urlencoded } from 'express';
import { AUTH_COOKIE_NAME } from '../common/constants/constantsDefinition';

async function bootstrap() {
  // 1. Criação da aplicação com buffer de logs
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    snapshot: true,
  });

  // 2. Serviços iniciais
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap'); // Cria uma instância do Logger

  // 3. Configuração de limites de payload
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // 4. Middlewares essenciais
  app.use(cookieParser(configService.get('COOKIE_SECRET')));
  app.useLogger(logger); // Usa o Logger criado

  // 5. Configuração global de validação
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
        exposeDefaultValues: true,
      },
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.reduce((acc, error) => {
          acc[error.property] = Object.values(error.constraints || {});
          return acc;
        }, {});
        throw new HttpException(
          {
            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            message: 'Validation failed',
            errors: formattedErrors,
            timestamp: new Date().toISOString(),
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      },
    }),
  );

  // 6. Filtro global de exceções
  app.useGlobalFilters(new HttpExceptionFilter());

  // 7. Configuração de CORS aprimorada
  const allowedOrigins = (configService.get('NEXT_PUBLIC_WEB_URL') || '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);

  app.enableCors({
    origin:
      allowedOrigins.length > 0
        ? allowedOrigins
        : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
      'X-CSRF-Token',
      'X-Forwarded-For',
      'X-Real-IP',
    ],
    exposedHeaders: ['Content-Disposition'],
  });

  // 8. Documentação Swagger (apenas em desenvolvimento)
  if (configService.get('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Drovi Delivery API')
      .setDescription(
        `
        ## API para gestão de entregas
        **Roles disponíveis:**
        - ADMIN: Acesso completo
        - BUSINESS: Gestão de pedidos e de contratação de motoboys
        - MOTOBOY: Acompanhamento de entregas

        ### Autenticação
        Use \`/auth/login\` para obter o token e clique no botão **Authorize** acima
      `,
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Insira o token JWT sem "Bearer"',
        },
        'jwt',
      )
      .addCookieAuth(
        AUTH_COOKIE_NAME,
        {
          type: 'apiKey',
          in: 'cookie',
          description: 'Token de autenticação HTTP-Only',
        },
        'cookie',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api-docs', app, document, {
      customSiteTitle: 'Drovi API Explorer',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        showCommonExtensions: true,
        defaultModelsExpandDepth: -1,
        tagsSorter: 'alpha',
        operationsSorter: (a, b) => {
          const order = ['POST', 'GET', 'PATCH', 'PUT', 'DELETE'];
          return (
            order.indexOf(a.get('method')) - order.indexOf(b.get('method'))
          );
        },
      },
      customCss: `
        .topbar { background-color: #1e293b !important }
        .swagger-ui .info { margin: 20px 0 !important }
      `,
    });
  }

  // 9. Configurações finais
  app.enableShutdownHooks();
  app.setGlobalPrefix('api', {
    exclude: ['health', 'api-docs'],
  });

  // 10. Inicialização do servidor
  const port = configService.get('PORT') || 3001;
  await app.listen(port);

  // 11. Logs de inicialização
  logger.log(`🚀 Aplicação rodando em ${await app.getUrl()}/api-docs`);
  logger.log(`📌 Ambiente: ${configService.get('NODE_ENV')}`);
  logger.log(
    `🔒 CORS habilitado para: ${allowedOrigins.join(', ') || 'localhost padrão'}`,
  );
}

bootstrap().catch((error) => {
  const logger = new Logger('Main'); // Cria uma instância do Logger para o catch
  logger.error('Falha na inicialização', error.stack);
  process.exit(1);
});
