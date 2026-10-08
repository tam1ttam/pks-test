import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Course } from './course.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ unique: true, length: 16 }) code!: string;
  @Column({ unique: true, length: 80 }) name!: string;
  @Column({ name: 'is_active', default: true }) isActive!: boolean;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @OneToMany(() => Course, course => course.categoryEntity) courses!: Course[];
}
