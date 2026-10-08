import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAccounts1791374400000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE users (
      id uuid PRIMARY KEY,
      full_name varchar(100) NOT NULL,
      email varchar(254) NOT NULL UNIQUE,
      password_hash varchar NULL,
      google_id varchar NULL UNIQUE,
      role varchar(16) NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('STUDENT','ADMIN','STAFF')),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CHECK (password_hash IS NOT NULL OR google_id IS NOT NULL)
    )`);
    await queryRunner.query(`CREATE TABLE auth_sessions (
      id uuid PRIMARY KEY,
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at timestamptz NOT NULL
    )`);
    await queryRunner.query('CREATE INDEX idx_auth_sessions_user ON auth_sessions(user_id)');
    await queryRunner.query('CREATE INDEX idx_auth_sessions_expiry ON auth_sessions(expires_at)');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE auth_sessions');
    await queryRunner.query('DROP TABLE users');
  }
}
