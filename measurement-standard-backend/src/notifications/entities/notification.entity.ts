
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  title!: string;

  @Column('text')
  message!: string;

  @Column({
    default: false,
  })
  is_read!: boolean;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  type!: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  url!: string | null;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  data!: Record<string, any> | null;

  @Index()
  @CreateDateColumn()
  created_at!: Date;

  @Index()
  @Column({
    type: 'timestamp',
    nullable: true,
  })
  expires_at!: Date | null;
}