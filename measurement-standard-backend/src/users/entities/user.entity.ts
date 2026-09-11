import { Role } from 'src/auth/enums/role.enum';
import { UserProgress } from 'src/user-progress/entities/user-progress.entity';
import { UserResponse } from 'src/user-responses/entities/user-response.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  password_hash!: string;

  @CreateDateColumn()
  created_at!: Date;

  @Column({ nullable: true })
  profile_picture!: string;


  @Column({
      type: 'enum',
      enum: Role,
      default: Role.USER,
    })
  role!: Role;  


  @Column({ nullable: true })
  refresh_token!: string;

  @OneToMany(() => UserProgress, (progress) => progress.user)
  progress!: UserProgress[];

  @OneToMany(() => UserResponse, (response) => response.user)
  responses!: UserResponse[];
}