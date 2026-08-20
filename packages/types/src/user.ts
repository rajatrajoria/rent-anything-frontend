export type UserRole = "USER" | "ADMIN";

/** UNTRUSTED is the default at signup; PENDING/TRUSTED are admin-set. */
export type TrustStatus = "UNTRUSTED" | "PENDING" | "TRUSTED";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

/** The caller's own profile. */
export interface UserProfileResponse {
  id: number;
  email: string;
  name: string | null;
  mobileNumber: string | null;
  isVerified: boolean;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  trustStatus: TrustStatus;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
