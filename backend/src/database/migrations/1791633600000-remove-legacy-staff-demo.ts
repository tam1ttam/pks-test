import type { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveLegacyStaffDemo1791633600000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DELETE FROM users WHERE id = '10000000-0000-4000-8000-000000000002' AND email = 'staff@pks.demo'");
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO users (id, full_name, email, password_hash, role)
      VALUES ('10000000-0000-4000-8000-000000000002', 'Legacy Admin', 'staff@pks.demo',
      '$2b$10$QXg4tr9dX5fZDuJu5UjWPutnh7HXslratiWzPoyXlNOno33Qu7ikO', 'ADMIN')
      ON CONFLICT (id) DO NOTHING`);
  }
}
