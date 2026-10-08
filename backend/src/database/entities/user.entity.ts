import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Enrollment } from './enrollment.entity';

export type UserRole = 'STUDENT' | 'ADMIN';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ unique: true, length: 16 }) code!: string;
  @Column({ name: 'full_name', length: 100 }) fullName!: string;
  @Column({ unique: true, length: 254 }) email!: string;
  @Column({ name: 'password_hash', type: 'varchar', nullable: true, select: false }) passwordHash!: string | null;
  @Column({ name: 'google_id', type: 'varchar', unique: true, nullable: true, select: false }) googleId!: string | null;
  @Column({ type: 'varchar', length: 16, default: 'STUDENT' }) role!: UserRole;
  @Column({ name: 'is_active', default: true }) isActive!: boolean;
  @Column({ name: 'avatar_url', type: 'varchar', length: 1000, nullable: true }) avatarUrl!: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
  @OneToMany(() => Enrollment, enrollment => enrollment.student) enrollments!: Enrollment[];
}
