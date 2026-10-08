import type { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveStaffRole1791547200000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("UPDATE users SET role = 'ADMIN', updated_at = now() WHERE role = 'STAFF'");
    await queryRunner.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
    await queryRunner.query("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('STUDENT','ADMIN'))");
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
    await queryRunner.query("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('STUDENT','ADMIN','STAFF'))");
  }
}
