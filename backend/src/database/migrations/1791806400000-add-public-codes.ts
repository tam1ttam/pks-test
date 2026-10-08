import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPublicCodes1791806400000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    for (const [table, prefix] of [['users', 'USR'], ['courses', 'CRS'], ['enrollments', 'ENR']] as const) {
      await queryRunner.query(`ALTER TABLE ${table} ADD COLUMN code varchar(16)`);
      await queryRunner.query(`UPDATE ${table} SET code = '${prefix}-' || upper(substr(md5(id::text), 1, 12))`);
      await queryRunner.query(`ALTER TABLE ${table} ALTER COLUMN code SET NOT NULL`);
      await queryRunner.query(`ALTER TABLE ${table} ADD CONSTRAINT uq_${table}_code UNIQUE (code)`);
    }
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of ['enrollments', 'courses', 'users']) await queryRunner.query(`ALTER TABLE ${table} DROP COLUMN code`);
  }
}
