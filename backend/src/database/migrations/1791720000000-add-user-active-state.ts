import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserActiveState1791720000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE users ADD COLUMN is_active boolean NOT NULL DEFAULT true');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE users DROP COLUMN is_active');
  }
}
