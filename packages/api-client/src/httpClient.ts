import type { ApiResponse } from "@rent-anything/types";
import { API_BASE_URL } from "./config";
import { ApiClientError, ApiUnreachableError } from "./errors";
import { clearSessionTokens, getAccessToken, getRefreshToken, setSessionTokens } from "./tokenStore";

type QueryValue = string | number | boolean | undefined | null;

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, QueryValue>;
  body?: unknown;
  /** Skip attaching Authorization and skip the 401-refresh dance. */
  skipAuth?: boolean;
}

type SessionExpiredListener = () => void;
const sessionExpiredListeners = new Set<SessionExpiredListener>();

/** The app's root layout subscribes to this to redirect to /login. */
export function onSessionExpired(listener: SessionExpiredListener): () => void {
  sessionExpiredListeners.add(listener);
  return () => sessionExpiredListeners.delete(listener);
}

function emitSessionExpired(): void {
  clearSessionTokens();
  for (const listener of sessionExpiredListeners) listener();
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function parseEnvelope<T>(response: Response): Promise<T | undefined> {
  let envelope: ApiResponse<T>;
  try {
    envelope = await response.json();
  } catch (cause) {
    throw new ApiUnreachableError(cause);
  }
  if (!envelope.success) {
    if (!envelope.error) throw new ApiUnreachableError(new Error("Malformed error response"));
    throw new ApiClientError(envelope.error);
  }
  return envelope.data;
}

let refreshInFlight: Promise<boolean> | null = null;

/** Single-flight: concurrent 401s share one /auth/refresh call. */
async function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = doRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function doRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(buildUrl("/auth/refresh", { refreshToken }), { method: "POST" });
    const data = await parseEnvelope<{ accessToken: string; refreshToken: string }>(response);
    if (!data) return false;
    setSessionTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T | undefined> {
  const { method = "GET", query, body, skipAuth = false } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (!skipAuth) {
    const accessToken = getAccessToken();
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (cause) {
    throw new ApiUnreachableError(cause);
  }

  if (response.status === 401 && !skipAuth) {
    const refreshed = await refreshSession();
    if (refreshed) {
      const retryHeaders: Record<string, string> = { ...headers };
      const newAccessToken = getAccessToken();
      if (newAccessToken) retryHeaders.Authorization = `Bearer ${newAccessToken}`;
      try {
        response = await fetch(buildUrl(path, query), {
          method,
          headers: retryHeaders,
          body: body !== undefined ? JSON.stringify(body) : undefined,
        });
      } catch (cause) {
        throw new ApiUnreachableError(cause);
      }
    } else {
      emitSessionExpired();
      throw new ApiClientError({
        timeStamp: new Date().toISOString(),
        status: 401,
        errorCode: "AUTH_004",
        errorName: "AUTH_UNAUTHENTICATED",
        message: "Your session has expired. Please log in again.",
        path,
      });
    }
  }

  return parseEnvelope<T>(response);
}

export { API_BASE_URL };
