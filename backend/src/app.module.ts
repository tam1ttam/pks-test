import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import configuration, { validateEnvironment } from './config/configuration';
import databaseConfig, { databaseOptions } from './config/database.config';
import jwtConfig from './config/jwt.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CoursesModule } from './modules/courses/courses.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration, databaseConfig, jwtConfig], validate: validateEnvironment }),
    TypeOrmModule.forRootAsync({ useFactory: () => ({ ...databaseOptions(), retryAttempts: 1 }) }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
    UsersModule, AuthModule, CoursesModule, EnrollmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
