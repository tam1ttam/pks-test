import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type UserRole = 'STUDENT' | 'ADMIN' | 'STAFF';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'full_name', length: 100 }) fullName!: string;
  @Column({ unique: true, length: 254 }) email!: string;
  @Column({ name: 'password_hash', type: 'varchar', nullable: true, select: false }) passwordHash!: string | null;
  @Column({ name: 'google_id', type: 'varchar', unique: true, nullable: true, select: false }) googleId!: string | null;
  @Column({ type: 'varchar', length: 16, default: 'STUDENT' }) role!: UserRole;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
