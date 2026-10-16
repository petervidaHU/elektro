/**
 * The API returns error *codes*, never human-readable messages: the frontend
 * maps a code to an i18next key.
 */
export const ERROR_CODES = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_FAILED: "VALIDATION_FAILED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  EMAIL_IN_USE: "EMAIL_IN_USE",
  INVALID_STATUS_TRANSITION: "INVALID_STATUS_TRANSITION",
  LOCALE_NOT_SUPPORTED: "LOCALE_NOT_SUPPORTED",
  CALCULATION_INPUT_INVALID: "CALCULATION_INPUT_INVALID",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export interface ApiErrorBody {
  /** Stable, translatable error code. */
  code: ErrorCode;
  /** Optional field-level details for `VALIDATION_FAILED`. */
  details?: Record<string, string[]>;
}
