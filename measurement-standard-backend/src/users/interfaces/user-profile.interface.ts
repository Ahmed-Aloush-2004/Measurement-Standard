
interface UserProfile {
  id: string;
  username: string;
  email: string;
  created_at: Date;
  profile_picture?: string; // Optional property for profile picture URL
}


export default UserProfile ;