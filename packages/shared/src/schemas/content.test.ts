import { describe, expect, it } from "vitest";
import { createLessonSchema } from "./content.js";

describe("createLessonSchema", () => {
  const base = { topicId: "voltage-drop", slug: "feszultsegeses-alapjai" };

  it("accepts a lesson without a position (it goes first, at 0)", () => {
    expect(createLessonSchema.parse(base).position).toBe(0);
  });

  it("accepts a non-negative integer position within the topic", () => {
    expect(createLessonSchema.parse({ ...base, position: 3 }).position).toBe(3);
  });

  it("rejects negative or fractional positions", () => {
    expect(createLessonSchema.safeParse({ ...base, position: -1 }).success).toBe(false);
    expect(createLessonSchema.safeParse({ ...base, position: 1.5 }).success).toBe(false);
  });

  it("accepts the new syllabus topics", () => {
    expect(createLessonSchema.safeParse({ ...base, topicId: "isolation-procedure" }).success).toBe(
      true,
    );
  });
});
