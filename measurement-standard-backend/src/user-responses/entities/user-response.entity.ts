import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Question } from '../../questions/entities/question.entity';
import { Choice } from '../../choices/entities/choice.entity';
import { TestSession } from '../../test-sessions/entities/test-session.entity';

@Entity('user_responses')
@Index(
  'IDX_USER_RESPONSE_USER_QUESTION',
  ['user', 'question'],
  { unique: true },
)
export class UserResponse {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.responses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Question, (question) => question.responses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question!: Question;

  // الخيار الذي اختاره المستخدم (لتتبع إجابته بالتفصيل)
  @ManyToOne(() => Choice, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'selected_choice_id' })
  selectedChoice!: Choice;

  // الجلسة التي أجاب خلالها (اختبار محدد)
  @ManyToOne(() => TestSession, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'test_session_id' })
  session!: TestSession;

  @Column()
  is_correct!: boolean;

  @CreateDateColumn()
  answered_at!: Date;


  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}