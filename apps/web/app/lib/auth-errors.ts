import { ERROR_CODES, type ErrorCode } from "@elektro/shared";

const VALIDATION_CODES = ["PASSWORD_TOO_SHORT", "PASSWORD_TOO_LONG", "INVALID_EMAIL"];

/**
 * Translates a failed better-auth sign-up (`/api/auth/sign-up/email`) into our
 * error codes; the UI never shows better-auth's own messages.
 */
export function signUpErrorCode(body: { code?: unknown } | null, status?: number): ErrorCode {
  if (status === 429) {
    return ERROR_CODES.RATE_LIMITED;
  }

  const code = typeof body?.code === "string" ? body.code : "";

  if (code.startsWith("USER_ALREADY_EXISTS")) {
    return ERROR_CODES.EMAIL_IN_USE;
  }
  if (VALIDATION_CODES.includes(code)) {
    return ERROR_CODES.VALIDATION_FAILED;
  }
  return ERROR_CODES.INTERNAL_ERROR;
}
