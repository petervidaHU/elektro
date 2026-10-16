import { describe, expect, it } from "vitest";
import { hasAtLeastRole, isRole, ROLES } from "./roles.js";

describe("hasAtLeastRole", () => {
  it("is reflexive for every role", () => {
    for (const role of ROLES) {
      expect(hasAtLeastRole(role, role)).toBe(true);
    }
  });

  it("ranks admin above teacher above student", () => {
    expect(hasAtLeastRole("admin", "teacher")).toBe(true);
    expect(hasAtLeastRole("admin", "student")).toBe(true);
    expect(hasAtLeastRole("teacher", "student")).toBe(true);
  });

  it("does not grant privileges downwards", () => {
    expect(hasAtLeastRole("student", "teacher")).toBe(false);
    expect(hasAtLeastRole("student", "admin")).toBe(false);
    expect(hasAtLeastRole("teacher", "admin")).toBe(false);
  });
});

describe("isRole", () => {
  it("accepts known roles and rejects anything else", () => {
    expect(isRole("admin")).toBe(true);
    expect(isRole("superuser")).toBe(false);
    expect(isRole(undefined)).toBe(false);
    expect(isRole(1)).toBe(false);
  });
});
