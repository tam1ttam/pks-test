import 'reflect-metadata';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupApp } from './common/utils/setup-app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupApp(app);
  const config = app.get(ConfigService);
  await app.listen(Number(config.get('PORT', 3030)));
}

bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
