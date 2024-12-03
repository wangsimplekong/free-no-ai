export interface UpdateProfileDTO {
  nickname?: string;
  avatarUrl?: string;
}

export interface UpdatePasswordDTO {
  newPassword: string;
}

export interface UserProfileDTO {
  id: string;
  username: string;
  nickname?: string;
  avatar_url?: string;
  created_at: string;
}