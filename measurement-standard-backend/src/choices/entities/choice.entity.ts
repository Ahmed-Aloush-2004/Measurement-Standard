import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Question } from '../../questions/entities/question.entity';

@Entity('choices')
export class Choice {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  content!: string;

  @Column({ default: false })
  is_correct!: boolean;

  @ManyToOne(() => Question, (question) => question.choices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question!: Question;
}