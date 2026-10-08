import type { MigrationInterface, QueryRunner } from 'typeorm';
export class AddMediaUrls1791892800000 implements MigrationInterface {
  name = 'AddMediaUrls1791892800000';
  async up(queryRunner: QueryRunner) { await queryRunner.query('ALTER TABLE "users" ADD COLUMN "avatar_url" varchar(1000)'); await queryRunner.query('ALTER TABLE "courses" ADD COLUMN "image_url" varchar(1000)'); }
  async down(queryRunner: QueryRunner) { await queryRunner.query('ALTER TABLE "courses" DROP COLUMN "image_url"'); await queryRunner.query('ALTER TABLE "users" DROP COLUMN "avatar_url"'); }
}
