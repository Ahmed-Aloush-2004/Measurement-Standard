// export enum Role {
//   USER = 'user',
//   ADMIN = 'admin',
//   SUPER_ADMIN = 'super_admin',
// }

// Or as a const object if you need runtime values:
export const Role = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const;

export type Role = typeof Role[keyof typeof Role];



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