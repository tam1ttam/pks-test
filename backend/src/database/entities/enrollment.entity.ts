import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { Course } from './course.entity';
import { User } from './user.entity';

export type EnrollmentStatus = 'ENROLLED' | 'CANCEL_REQUESTED' | 'CANCELLED';

@Entity('enrollments')
@Unique('uq_enrollment_student_course', ['studentId', 'courseId'])
export class Enrollment {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ unique: true, length: 16 }) code!: string;
  @Column({ name: 'student_id', type: 'uuid' }) studentId!: string;
  @Column({ name: 'course_id', type: 'uuid' }) courseId!: string;
  @Column({ type: 'varchar', length: 16, default: 'ENROLLED' }) status!: EnrollmentStatus;
  @CreateDateColumn({ name: 'enrolled_at', type: 'timestamptz' }) enrolledAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
  @ManyToOne(() => User, user => user.enrollments, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'student_id' }) student!: User;
  @ManyToOne(() => Course, course => course.enrollments, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'course_id' }) course!: Course;
}
