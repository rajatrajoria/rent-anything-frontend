import type { AuthResponse, LoginRequest } from "@rent-anything/types";
import { refreshSession, request } from "../httpClient";
import { clearSessionTokens, setSessionTokens } from "../tokenStore";

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
 *
 * Delegates to the shared single-flight refreshSession() rather than
 * issuing its own /auth/refresh call: refresh tokens rotate on every use,
 * so two concurrent restoreSession() calls (e.g. React StrictMode's
 * double-invoked mount effect) racing on the same stored token would
 * otherwise cause one to fail and clear the session the other just
 * established.
 */
export async function restoreSession(): Promise<boolean> {
  return refreshSession();
}
