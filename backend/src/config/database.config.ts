import { registerAs } from '@nestjs/config';
import type { DataSourceOptions } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { AuthSession } from '../database/entities/auth-session.entity';
import { CreateAccounts1791374400000 } from '../database/migrations/1791374400000-create-accounts';
import { Course } from '../database/entities/course.entity';
import { Enrollment } from '../database/entities/enrollment.entity';
import { CreateCoursesEnrollments1791460800000 } from '../database/migrations/1791460800000-create-courses-enrollments';
import { RemoveStaffRole1791547200000 } from '../database/migrations/1791547200000-remove-staff-role';
import { RemoveLegacyStaffDemo1791633600000 } from '../database/migrations/1791633600000-remove-legacy-staff-demo';
import { AddUserActiveState1791720000000 } from '../database/migrations/1791720000000-add-user-active-state';

export function databaseOptions(): DataSourceOptions {
  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'pkstest',
    entities: [User, AuthSession, Course, Enrollment],
    migrations: [CreateAccounts1791374400000, CreateCoursesEnrollments1791460800000, RemoveStaffRole1791547200000, RemoveLegacyStaffDemo1791633600000, AddUserActiveState1791720000000],
    synchronize: false,
    migrationsRun: false,
    logging: false,
  };
}

export default registerAs('database', databaseOptions);
