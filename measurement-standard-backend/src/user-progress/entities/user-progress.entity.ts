import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('user_progress')
export class UserProgress {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.progress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  overall_score!: number;

  @Column({ default: 0 })
  tests_completed!: number;

  @Column({ type: 'date', nullable: true })
  last_active_date!: Date;
}