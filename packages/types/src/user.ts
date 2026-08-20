export type UserRole = "USER" | "ADMIN";

/** UNTRUSTED is the default at signup; PENDING/TRUSTED are admin-set. */
export type TrustStatus = "UNTRUSTED" | "PENDING" | "TRUSTED";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * The caller's own profile. Notably has no trustStatus field — the backend
 * doesn't expose it here, so trust-gating in the UI must be reactive
 * (driven by catching USR_005 on a mutating call), not read proactively.
 */
export interface UserProfileResponse {
  id: number;
  email: string;
  name: string | null;
  mobileNumber: string | null;
  isVerified: boolean;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
