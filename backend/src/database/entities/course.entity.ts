import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Enrollment } from './enrollment.entity';
import { Category } from './category.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ unique: true, length: 16 }) code!: string;
  @Column({ length: 160 }) name!: string;
  @Column({ length: 80 }) category!: string;
  @Column({ name: 'category_code', length: 16 }) categoryCode!: string;
  @ManyToOne(() => Category, category => category.courses, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_code', referencedColumnName: 'code' }) categoryEntity!: Category;
  @Column({ length: 120 }) instructor!: string;
  @Column({ name: 'short_description', length: 500 }) shortDescription!: string;
  @Column({ type: 'text' }) description!: string;
  @Column({ type: 'numeric', precision: 12, scale: 0, transformer: { to: (value: number) => value, from: (value: string) => Number(value) } }) tuition!: number;
  @Column({ type: 'integer' }) capacity!: number;
  @Column({ name: 'enrolled_count', type: 'integer', default: 0 }) enrolledCount!: number;
  @Column({ name: 'is_published', default: true }) isPublished!: boolean;
  @Column({ name: 'image_url', type: 'varchar', length: 1000, nullable: true }) imageUrl!: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
  @OneToMany(() => Enrollment, enrollment => enrollment.course) enrollments!: Enrollment[];
}
