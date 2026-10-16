import { describe, expect, it } from "vitest";
import { loadEnv } from "./env.js";

const valid = {
  DATABASE_URL: "postgres://user:pass@localhost:5432/elektro",
  BETTER_AUTH_SECRET: "0123456789abcdef",
  BETTER_AUTH_URL: "https://example.com",
};

describe("loadEnv", () => {
  it("applies the documented defaults", () => {
    const env = loadEnv({ ...valid });

    expect(env.NODE_ENV).toBe("development");
    expect(env.PORT).toBe(3000);
    expect(env.TRUST_PROXY).toBe(false);
  });

  it("coerces PORT and TRUST_PROXY", () => {
    const env = loadEnv({ ...valid, PORT: "8080", TRUST_PROXY: "true" });

    expect(env.PORT).toBe(8080);
    expect(env.TRUST_PROXY).toBe(true);
  });

  it("fails loudly when a required variable is missing", () => {
    expect(() => loadEnv({ ...valid, DATABASE_URL: undefined })).toThrow(
      /DATABASE_URL/,
    );
    expect(() => loadEnv({ ...valid, BETTER_AUTH_SECRET: "short" })).toThrow(
      /BETTER_AUTH_SECRET/,
    );
    expect(() => loadEnv({ ...valid, BETTER_AUTH_URL: "not-a-url" })).toThrow(
      /BETTER_AUTH_URL/,
    );
  });
});
