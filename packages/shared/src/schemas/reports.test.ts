import { describe, expect, it } from "vitest";
import { createReportSchema } from "./reports.js";

describe("createReportSchema", () => {
  const valid = { targetKind: "lesson", targetId: "voltage-drop-intro", category: "wrong_value", locale: "hu" };

  it("accepts a report with and without note and version", () => {
    expect(createReportSchema.safeParse(valid).success).toBe(true);
    expect(createReportSchema.safeParse({ ...valid, targetVersion: 2, note: "A 3. sorban." }).success).toBe(true);
  });

  it("rejects unknown categories and kinds, and over-long notes", () => {
    expect(createReportSchema.safeParse({ ...valid, category: "spam" }).success).toBe(false);
    expect(createReportSchema.safeParse({ ...valid, targetKind: "user" }).success).toBe(false);
    expect(createReportSchema.safeParse({ ...valid, note: "x".repeat(1001) }).success).toBe(false);
  });
});
