import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('LankaPropertyAPI');
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend web and mobile apps
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global API route prefix
  app.setGlobalPrefix('api/v1');

  // Request validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // OpenAPI / Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('LankaProperty Enterprise API & Auction Gateway')
    .setDescription(
      'Headless backend powering real estate classifieds, real-time digital auctions, in-person inspection scheduling, and property exchanges in Sri Lanka.',
    )
    .setVersion('1.1.0')
    .addTag('Authentication', 'JWT and role-based authentication')
    .addTag('Properties', 'Sri Lanka real estate discovery and spatial search')
    .addTag('Digital Auctions', 'Live bidding engine with soft-close & confidential reserve')
    .addTag('In-Person Inspections', 'Appointment scheduling workflow')
    .addTag('Property Exchanges', 'Asset swaps and barter negotiations')
    .addTag('Admin & Moderation', 'Compliance, vetting, and platform governance')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`====================================================`);
  logger.log(`🚀 LankaProperty API running on http://localhost:${port}`);
  logger.log(`📖 Swagger API Docs available at http://localhost:${port}/api/docs`);
  logger.log(`====================================================`);
}
bootstrap();
