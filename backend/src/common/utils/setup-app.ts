import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { AppValidationPipe } from '../pipes/app-validation.pipe';

export function setupApp(app: INestApplication) {
  app.setGlobalPrefix('api');
  app.enableCors({ origin: app.get(ConfigService).getOrThrow<string[]>('frontendUrls'), credentials: true, allowedHeaders: ['Content-Type', 'X-PKS-Portal'] });
  app.useGlobalPipes(new AppValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
}
