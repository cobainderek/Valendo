import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

// To prevent TypeError: Do not know how to serialize a BigInt
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  // Fail-fast: sem segredo JWT o app não pode subir — um fallback hardcoded
  // permitiria forjar tokens em produção.
  if (!process.env.JWT_SECRET) {
    throw new Error(
      'JWT_SECRET não definido. Configure a variável de ambiente (veja .env.example) antes de iniciar o backend.',
    );
  }

  const app = await NestFactory.create(AppModule);

  // Security headers. CSP off: a API só serve JSON (e o Swagger UI em dev) — CSP
  // aqui quebraria o swagger sem ganho real; o site/HTML fica a cargo do Nginx.
  // CORP cross-origin: a API é consumida de outra origem (o frontend).
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.getHttpAdapter().getInstance().disable('x-powered-by');

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.setGlobalPrefix('api');

  const allowedOrigins = (process.env.CORS_ORIGINS ??
    'https://dyotech.shop,https://www.dyotech.shop,http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Behind Nginx: trust X-Forwarded-* so req.ip / secure are accurate
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  // Swagger/OpenAPI só fora de produção — expor o mapa completo da API em prod
  // seria entregar a superfície de ataque. Disponível em /api/docs.
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Valendo API')
      .setDescription('API da plataforma Valendo — auth, salas/duelos, perguntas (IA), amigos, chat e ranking.')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT ?? 3001;
  const host = process.env.API_HOST ?? '127.0.0.1';
  await app.listen(port, host);
}
bootstrap();
