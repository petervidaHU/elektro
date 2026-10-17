import { describe, expect, it } from "vitest";
import {
  calculatorInputSchema,
  reorderCalculatorsSchema,
  reorderLessonsSchema,
  updateLessonSchema,
} from "./manage.js";

describe("reorderLessonsSchema", () => {
  it("takes a topic and the full slug order", () => {
    const input = { topicId: "voltage-drop", slugs: ["a", "b"] };
    expect(reorderLessonsSchema.parse(input)).toEqual(input);
  });

  it("rejects an empty order or an unknown topic", () => {
    expect(reorderLessonsSchema.safeParse({ topicId: "voltage-drop", slugs: [] }).success).toBe(false);
    expect(reorderLessonsSchema.safeParse({ topicId: "nope", slugs: ["a"] }).success).toBe(false);
  });
});

describe("updateLessonSchema", () => {
  it("moves a lesson to another topic", () => {
    expect(updateLessonSchema.parse({ topicId: "ohms-law" })).toEqual({ topicId: "ohms-law" });
  });
});

describe("calculatorInputSchema", () => {
  const base = {
    topicId: "voltage-drop",
    published: true,
    locale: "hu",
    title: "Feszültségesés",
    description: "Vezeték feszültségesésének számítása.",
  };

  it("accepts the topic, visibility and the texts of one locale", () => {
    expect(calculatorInputSchema.parse(base)).toEqual(base);
  });

  it("requires a title and trims the texts", () => {
    expect(calculatorInputSchema.safeParse({ ...base, title: "  " }).success).toBe(false);
    expect(calculatorInputSchema.parse({ ...base, description: " x " }).description).toBe("x");
  });
});

describe("reorderCalculatorsSchema", () => {
  it("only takes calculators implemented in code", () => {
    expect(reorderCalculatorsSchema.safeParse({ ids: ["voltage-drop"] }).success).toBe(true);
    expect(reorderCalculatorsSchema.safeParse({ ids: ["made-up"] }).success).toBe(false);
  });
});
