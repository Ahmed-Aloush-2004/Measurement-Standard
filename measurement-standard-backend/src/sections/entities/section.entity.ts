import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ExamType } from '../../exam-types/entities/exam-type.entity';
import { Question } from '../../questions/entities/question.entity';

@Entity('sections')
export class Section {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @ManyToOne(() => ExamType, (examType) => examType.sections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exam_type_id' })
  examType!: ExamType;

  @OneToMany(() => Question, (question) => question.section)
  questions!: Question[];
}