import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Section } from '../../sections/entities/section.entity';
import { Choice } from '../../choices/entities/choice.entity';
import { UserResponse } from '../../user-responses/entities/user-response.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  content!: string;

  @Column('text', { nullable: true })
  explanation!: string;

  @ManyToOne(() => Section, (section) => section.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'section_id' })
  section!: Section;

  @OneToMany(() => Choice, (choice) => choice.question)
  choices!: Choice[];

  @OneToMany(() => UserResponse, (response) => response.question)
  responses!: UserResponse[];
}