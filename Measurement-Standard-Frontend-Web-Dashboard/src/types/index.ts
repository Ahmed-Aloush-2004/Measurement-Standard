export enum Role {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: Role;
  profile_picture?: string;
  created_at?: string;
}

export interface ExamType {
  id: string;
  name: string;
  code: string;
  sections?: Section[];
}

export interface Section {
  id: string;
  name: string;
  examType?: ExamType;
}

export interface Choice {
  id?: string;
  content: string;
  is_correct: boolean;
}

export interface Question {
  id: string;
  content: string;
  explanation?: string;
  section?: Section;
  choices?: Choice[];
}