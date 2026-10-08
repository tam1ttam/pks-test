import { Module } from '@nestjs/common';
import { CourseEnrollmentsController, EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';

@Module({ controllers: [EnrollmentsController, CourseEnrollmentsController], providers: [EnrollmentsService] })
export class EnrollmentsModule {}
