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
  /** The topic has no practice tasks. */
  PRACTICE_NOT_AVAILABLE: "PRACTICE_NOT_AVAILABLE",
  /** An earlier step (or task) must be finished first. */
  PRACTICE_STEP_LOCKED: "PRACTICE_STEP_LOCKED",
  /** The step is already answered correctly or revealed. */
  PRACTICE_STEP_DONE: "PRACTICE_STEP_DONE",
  /** The solution can only be revealed after two wrong tries. */
  PRACTICE_SOLUTION_LOCKED: "PRACTICE_SOLUTION_LOCKED",
  /** All hints of the step are already shown. */
  PRACTICE_NO_MORE_HINTS: "PRACTICE_NO_MORE_HINTS",
  /** The session is finished (or abandoned) and can no longer change. */
  PRACTICE_SESSION_CLOSED: "PRACTICE_SESSION_CLOSED",
  /** A session can only be finished when every task is done. */
  PRACTICE_NOT_COMPLETE: "PRACTICE_NOT_COMPLETE",
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
