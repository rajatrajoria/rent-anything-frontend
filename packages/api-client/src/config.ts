const DEFAULT_API_BASE_URL = "http://localhost:8080";

function readApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
  return url.replace(/\/$/, "");
}

export const API_BASE_URL = readApiBaseUrl();
