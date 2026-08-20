/** Every backend response is wrapped in this envelope, success or failure. */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  timeStamp: string;
  status: number;
  errorCode: ErrorCode;
  errorName: string;
  message: string;
  path: string;
}

/** Transcribed from ErrorCode.java — keep in sync with the backend enum. */
export type ErrorCode =
  // Booking
  | "BKG_001" // BOOKING_NOT_FOUND
  | "BKG_002" // BOOKING_CONFLICT
  | "BKG_003" // BOOKING_DATES_INVALID
  | "BKG_004" // BOOKING_STATE_TRANSITION_INVALID
  | "BKG_005" // SELF_BOOKING_NOT_ALLOWED
  | "BKG_006" // BOOKING_ACTION_UNAUTHORIZED
  // Item
  | "ITM_001" // ITEM_NOT_FOUND
  | "ITM_002" // ITEM_INACTIVE
  | "ITM_003" // INVALID_ITEM_EXCEPTION
  | "ITM_004" // INVALID_ITEM_INPUT
  | "ITM_005" // INVALID_ITEM_LOCATION
  | "ITM_006" // INVALID_ITEM_PRICING
  | "ITM_007" // INVALID_AVAILABILITY_WINDOW
  | "ITM_008" // ILLEGAL_ITEM_MODIFICATION
  | "ITM_009" // IMAGE_STORAGE_FAILURE
  | "ITM_010" // INVALID_IMAGE_COUNT
  | "ITM_011" // INVALID_IMAGE_TYPE
  | "ITM_012" // IMAGE_TOO_LARGE
  | "ITM_013" // ITEM_IMAGE_NOT_FOUND
  // User
  | "USR_001" // USER_NOT_FOUND
  | "USR_002" // EMAIL_ALREADY_IN_USE
  | "USR_003" // INVALID_PASSWORD
  | "USR_004" // INVALID_USER_INPUT
  | "USR_005" // TRUST_GATE_FAILURE
  | "USR_006" // USER_OPERATION_UNAUTHORIZED
  // Security
  | "SEC_001" // INVALID_TOKEN
  | "SEC_002" // INVALID_SECURITY_OPERATION
  | "AUTH_001" // AUTH_ACCOUNT_NOT_VERIFIED
  | "AUTH_002" // AUTH_INVALID_CREDENTIALS
  | "AUTH_003" // AUTH_ACCESS_DENIED
  | "AUTH_004"; // AUTH_UNAUTHENTICATED
