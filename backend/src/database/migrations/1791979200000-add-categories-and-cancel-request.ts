import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategoriesAndCancelRequest1791979200000 implements MigrationInterface {
  name = 'AddCategoriesAndCancelRequest1791979200000';
  async up(queryRunner: QueryRunner) {
    await queryRunner.query('CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "code" varchar(16) NOT NULL, "name" varchar(80) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" timestamptz NOT NULL DEFAULT now(), CONSTRAINT "uq_categories_code" UNIQUE ("code"), CONSTRAINT "uq_categories_name" UNIQUE ("name"), CONSTRAINT "pk_categories" PRIMARY KEY ("id"))');
    await queryRunner.query(`INSERT INTO "categories" ("code", "name") SELECT 'CAT-' || LPAD(ROW_NUMBER() OVER (ORDER BY "category")::text, 4, '0'), "category" FROM (SELECT DISTINCT "category" FROM "courses") source`);
    await queryRunner.query('ALTER TABLE "courses" ADD COLUMN "category_code" varchar(16)');
    await queryRunner.query('UPDATE "courses" c SET "category_code" = x."code" FROM "categories" x WHERE x."name" = c."category"');
    await queryRunner.query('ALTER TABLE "courses" ALTER COLUMN "category_code" SET NOT NULL');
    await queryRunner.query('ALTER TABLE "courses" ADD CONSTRAINT "fk_courses_category" FOREIGN KEY ("category_code") REFERENCES "categories"("code") ON DELETE RESTRICT');
    await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT IF EXISTS "chk_enrollment_status"`);
    await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT IF EXISTS "enrollments_status_check"`);
    await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "chk_enrollment_status" CHECK ("status" IN ('ENROLLED','CANCEL_REQUESTED','CANCELLED'))`);
  }
  async down(queryRunner: QueryRunner) {
    await queryRunner.query('ALTER TABLE "enrollments" DROP CONSTRAINT IF EXISTS "chk_enrollment_status"');
    await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "chk_enrollment_status" CHECK ("status" IN ('ENROLLED','CANCELLED'))`);
    await queryRunner.query('ALTER TABLE "courses" DROP CONSTRAINT "fk_courses_category"');
    await queryRunner.query('ALTER TABLE "courses" DROP COLUMN "category_code"');
    await queryRunner.query('DROP TABLE "categories"');
  }
}
