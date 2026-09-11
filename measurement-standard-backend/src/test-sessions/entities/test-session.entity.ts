import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ExamType } from '../../exam-types/entities/exam-type.entity';

@Entity('test_sessions')
export class TestSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => ExamType, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'exam_type_id' })
  examType!: ExamType;

  @Column({ type: 'int' })
  score!: number;

  @Column({ type: 'int' })
  total_questions!: number;

  @CreateDateColumn()
  created_at!: Date;
}