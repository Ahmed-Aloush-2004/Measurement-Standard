import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
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

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => Section, (section) => section.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'section_id' })
  section!: Section;

  @OneToMany(() => Choice, (choice) => choice.question,{ cascade: true, onDelete: 'CASCADE' })
  choices!: Choice[];

  @OneToMany(() => UserResponse, (response) => response.question)
  responses!: UserResponse[];
}