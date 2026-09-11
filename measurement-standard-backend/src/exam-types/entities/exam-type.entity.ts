import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Section } from '../../sections/entities/section.entity';

@Entity('exam_types')
export class ExamType {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @OneToMany(() => Section, (section) => section.examType)
  sections!: Section[];
}