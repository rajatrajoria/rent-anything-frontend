/**
 * Token storage strategy (deliberate, not incidental): the backend returns
 * tokens in the JSON response body, not cookies, so httpOnly cookies aren't
 * an option without a backend change. Instead:
 *
 * - The access token lives only in memory (this module). It's never
 *   persisted, so an XSS payload reading localStorage can't get a live
 *   bearer token — only a page reload costs one extra /auth/refresh call to
 *   re-hydrate it.
 * - The refresh token lives in localStorage. It's longer-lived but rotates
 *   on every use, which bounds the damage of it leaking.
 */

const REFRESH_TOKEN_KEY = "rentAnything.refreshToken";

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function setSessionTokens(accessTokenValue: string, refreshTokenValue: string): void {
  setAccessToken(accessTokenValue);
  setRefreshToken(refreshTokenValue);
}

export function clearSessionTokens(): void {
  setAccessToken(null);
  setRefreshToken(null);
}
