import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Security headers
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  app.setGlobalPrefix('gds/api');

  app.enableCors({
    origin: [
      'https://illimi.ai',
      'http://localhost:4200',
      'http://grenier-sahel.org',
      'https://grenier-sahel.org',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  // Global validation pipe — validates all DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,         // strips unknown properties
    forbidNonWhitelisted: false,
    transform: true,          // auto-converts types
    transformOptions: { enableImplicitConversion: true },
  }));

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('Grenier du Sahel API')
    .setDescription('API de la plateforme agricole du Sahel')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentification')
    .addTag('produits', 'Gestion des produits')
    .addTag('demandes', 'Gestion des demandes')
    .addTag('users', 'Gestion des utilisateurs')
    .addTag('stats', 'Statistiques & Dashboard')
    .addTag('reviews', 'Avis et notations')
    .addTag('favorites', 'Favoris')
    .addTag('notifications', 'Notifications')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Static files
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  await app.listen(process.env.PORT || 3000);
  console.log(`Application running on port ${process.env.PORT || 3000}`);
  console.log(`Swagger docs: http://localhost:${process.env.PORT || 3000}/api/docs`);
}
bootstrap();
