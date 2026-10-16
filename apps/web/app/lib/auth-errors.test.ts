import { describe, expect, it } from "vitest";
import { signUpErrorCode } from "./auth-errors";

/** better-auth answers with its own codes; the UI only knows ours. */
describe("signUpErrorCode", () => {
  it("maps an already registered e-mail to EMAIL_IN_USE", () => {
    expect(signUpErrorCode({ code: "USER_ALREADY_EXISTS" })).toBe("EMAIL_IN_USE");
    expect(signUpErrorCode({ code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" })).toBe(
      "EMAIL_IN_USE",
    );
  });

  it("maps input problems to VALIDATION_FAILED", () => {
    expect(signUpErrorCode({ code: "PASSWORD_TOO_SHORT" })).toBe("VALIDATION_FAILED");
    expect(signUpErrorCode({ code: "INVALID_EMAIL" })).toBe("VALIDATION_FAILED");
  });

  it("maps rate limiting to RATE_LIMITED", () => {
    expect(signUpErrorCode(null, 429)).toBe("RATE_LIMITED");
  });

  it("falls back to INTERNAL_ERROR for anything unknown", () => {
    expect(signUpErrorCode(null)).toBe("INTERNAL_ERROR");
    expect(signUpErrorCode({ code: "SOMETHING_NEW" })).toBe("INTERNAL_ERROR");
  });
});
