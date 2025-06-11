import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { TransformInterceptor } from './shared/interceptors/transform.interceptor';
import * as dotenv from 'dotenv';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

dotenv.config({ override: true });

async function bootstrap() {
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  server.set('trust proxy', true);

  const configService = app.get(ConfigService);

  // Global Pipes, Filters, Interceptors
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Payslip API')
    .setDescription('API documentation for the payslip generation system.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // Get port from .env
  const port = configService.get<number>('APP_PORT') || 3000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
