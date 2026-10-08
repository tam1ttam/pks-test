import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Enrollment } from './enrollment.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ length: 160 }) name!: string;
  @Column({ length: 80 }) category!: string;
  @Column({ length: 120 }) instructor!: string;
  @Column({ name: 'short_description', length: 500 }) shortDescription!: string;
  @Column({ type: 'text' }) description!: string;
  @Column({ type: 'numeric', precision: 12, scale: 0, transformer: { to: (value: number) => value, from: (value: string) => Number(value) } }) tuition!: number;
  @Column({ type: 'integer' }) capacity!: number;
  @Column({ name: 'enrolled_count', type: 'integer', default: 0 }) enrolledCount!: number;
  @Column({ name: 'is_published', default: true }) isPublished!: boolean;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
  @OneToMany(() => Enrollment, enrollment => enrollment.course) enrollments!: Enrollment[];
}
