import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCoursesEnrollments1791460800000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE courses (
      id uuid PRIMARY KEY,
      name varchar(160) NOT NULL,
      category varchar(80) NOT NULL,
      instructor varchar(120) NOT NULL,
      short_description varchar(500) NOT NULL,
      description text NOT NULL,
      tuition numeric(12,0) NOT NULL CHECK (tuition >= 0),
      capacity integer NOT NULL CHECK (capacity > 0 AND capacity <= 100000),
      enrolled_count integer NOT NULL DEFAULT 0,
      is_published boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT ck_course_count CHECK (enrolled_count >= 0 AND enrolled_count <= capacity)
    )`);
    await queryRunner.query(`CREATE TABLE enrollments (
      id uuid PRIMARY KEY,
      student_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      course_id uuid NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
      status varchar(16) NOT NULL DEFAULT 'ENROLLED' CHECK (status IN ('ENROLLED','CANCELLED')),
      enrolled_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT uq_enrollment_student_course UNIQUE(student_id, course_id)
    )`);
    await queryRunner.query('CREATE INDEX idx_enrollments_course ON enrollments(course_id, status)');
    await queryRunner.query('CREATE INDEX idx_courses_category ON courses(category)');
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE enrollments');
    await queryRunner.query('DROP TABLE courses');
  }
}
