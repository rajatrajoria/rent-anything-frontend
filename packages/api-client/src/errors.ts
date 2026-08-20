import type { ApiError, ErrorCode } from "@rent-anything/types";

export class ApiClientError extends Error {
  readonly status: number;
  readonly errorCode: ErrorCode;
  readonly errorName: string;
  readonly path: string;

  constructor(error: ApiError) {
    super(error.message);
    this.name = "ApiClientError";
    this.status = error.status;
    this.errorCode = error.errorCode;
    this.errorName = error.errorName;
    this.path = error.path;
  }
}

/**
 * A network failure or a response the server never wrapped in the usual
 * envelope (e.g. the API is unreachable, or a proxy/gateway error page).
 */
export class ApiUnreachableError extends Error {
  constructor(cause: unknown) {
    super("Could not reach the server. Check your connection and try again.");
    this.name = "ApiUnreachableError";
    this.cause = cause;
  }
}

/** User-facing copy for error codes the UI special-cases. */
export const ERROR_MESSAGES: Partial<Record<ErrorCode, string>> = {
  BKG_002: "These dates were just booked by someone else — please pick different dates.",
  BKG_005: "You can't book your own listing.",
  USR_005: "Your account is pending review. You'll be able to do this once an admin approves it.",
  AUTH_001: "Please verify your email before logging in.",
  AUTH_002: "Incorrect email or password.",
  ITM_002: "This listing is no longer active.",
  ITM_010: "You need between 2 and 5 photos.",
  ITM_012: "One of your images is too large (max 10MB).",
};

export function messageFor(error: ApiClientError): string {
  return ERROR_MESSAGES[error.errorCode] ?? error.message;
}
