import type { AuthResponse, LoginRequest } from "@rent-anything/types";
import { request } from "../httpClient";
import { clearSessionTokens, getRefreshToken, setSessionTokens } from "../tokenStore";

export async function signup(email: string, password: string): Promise<number> {
  const userId = await request<number>("/auth/signup", {
    method: "POST",
    query: { email, password },
    skipAuth: true,
  });
  return userId!;
}

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const auth = await request<AuthResponse>("/auth/login", {
    method: "POST",
    body: credentials,
    skipAuth: true,
  });
  setSessionTokens(auth!.accessToken, auth!.refreshToken);
  return auth!;
}

export async function verifyEmail(token: string): Promise<void> {
  await request<void>("/auth/verify-email", { method: "GET", query: { token }, skipAuth: true });
}

export async function resendVerificationEmail(email: string): Promise<void> {
  await request<void>("/auth/resend-verification-email", {
    method: "POST",
    query: { email },
    skipAuth: true,
  });
}

export async function forgotPassword(email: string): Promise<void> {
  await request<void>("/auth/forgot-password", { method: "POST", query: { email }, skipAuth: true });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await request<void>("/auth/reset-password", {
    method: "POST",
    query: { token, newPassword },
    skipAuth: true,
  });
}

export function logoutLocal(): void {
  clearSessionTokens();
}

/**
 * Called once on app load. If a refresh token survived from a previous
 * visit, exchange it for a fresh access token so the session survives a
 * page reload. Returns whether a session was restored.
 */
export async function restoreSession(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  try {
    const auth = await request<AuthResponse>("/auth/refresh", {
      method: "POST",
      query: { refreshToken },
      skipAuth: true,
    });
    if (!auth) return false;
    setSessionTokens(auth.accessToken, auth.refreshToken);
    return true;
  } catch {
    clearSessionTokens();
    return false;
  }
}
