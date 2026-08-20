import type { UpdatePasswordRequest, UserProfileResponse } from "@rent-anything/types";
import { request } from "../httpClient";
import { getRefreshToken, clearSessionTokens } from "../tokenStore";

export async function getMe(): Promise<UserProfileResponse> {
  return (await request<UserProfileResponse>("/users/me"))!;
}

export async function updatePassword(input: UpdatePasswordRequest): Promise<void> {
  await request<void>("/users/password", { method: "PUT", body: input });
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    await request<void>("/users/logout", { method: "POST", query: { refreshToken } });
  }
  clearSessionTokens();
}

export async function logoutAll(): Promise<void> {
  await request<void>("/users/logoutAll", { method: "POST" });
  clearSessionTokens();
}
