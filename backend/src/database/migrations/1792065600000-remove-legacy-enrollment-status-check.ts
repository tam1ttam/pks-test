import type { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveLegacyEnrollmentStatusCheck1792065600000 implements MigrationInterface {
  name = 'RemoveLegacyEnrollmentStatusCheck1792065600000';
  async up(queryRunner: QueryRunner) {
    await queryRunner.query('ALTER TABLE "enrollments" DROP CONSTRAINT IF EXISTS "enrollments_status_check"');
  }
  async down(queryRunner: QueryRunner) {
    await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_status_check" CHECK ("status" IN ('ENROLLED','CANCELLED'))`);
  }
}
