interface UserProfile {
  id: string;
  username: string;
  email: string;
  created_at: Date;
  profile_picture: string | null; // Profile picture URL; nullable in the users table
  role?: 'user' | 'admin' | 'super_admin';
}

export default UserProfile;
