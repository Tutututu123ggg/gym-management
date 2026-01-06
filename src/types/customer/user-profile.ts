export interface UserProfileData {
  id: string;
  name: string | null;
  email: string;
  role: string;
  phone: string | null;
  address: string | null;
  bio: string | null;
  avatar: string | null;
  gender: string | null;
  dateOfBirth: Date | string | null;
  createdAt: Date | string;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  address?: string;
  bio?: string;
  gender?: string;
  dateOfBirth?: Date | null;
}

export interface ProfileResponse {
  success: boolean;
  message?: string;
  user?: UserProfileData;
}