import { describe, expect, it } from "vitest";
import { loginPath, registerPath, safeReturnTo } from "./return-to";

describe("safeReturnTo", () => {
  it("keeps an in-app path of the same locale", () => {
    expect(safeReturnTo("/hu/simulator", "hu")).toBe("/hu/simulator");
    expect(safeReturnTo("/hu/lessons/feszultsegeses?x=1#a", "hu")).toBe(
      "/hu/lessons/feszultsegeses?x=1#a",
    );
  });

  it("falls back to the locale home for anything else (no open redirects)", () => {
    for (const value of [
      null,
      undefined,
      "",
      "https://evil.example/hu",
      "//evil.example/hu",
      "/\\evil.example",
      "/hu\\@evil.example",
      "javascript:alert(1)",
      "/de/lessons",
      "/hungary",
      "hu/lessons",
    ]) {
      expect(safeReturnTo(value, "hu"), String(value)).toBe("/hu");
    }
  });

  it("does not loop back to the auth pages", () => {
    expect(safeReturnTo("/hu/login", "hu")).toBe("/hu");
    expect(safeReturnTo("/hu/register?returnTo=/hu/x", "hu")).toBe("/hu");
  });
});

describe("loginPath / registerPath", () => {
  it("carries the return path as an encoded query parameter", () => {
    expect(loginPath("hu", "/hu/simulator")).toBe("/hu/login?returnTo=%2Fhu%2Fsimulator");
    expect(registerPath("hu", "/hu/simulator")).toBe("/hu/register?returnTo=%2Fhu%2Fsimulator");
  });

  it("omits the parameter when returning home", () => {
    expect(loginPath("hu", "/hu")).toBe("/hu/login");
    expect(registerPath("hu")).toBe("/hu/register");
  });
});
