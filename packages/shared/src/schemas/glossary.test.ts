import { describe, expect, it } from "vitest";
import {
  glossaryLetter,
  sortGlossary,
  termKeySchema,
  upsertGlossaryTranslationSchema,
  upsertTopicIntroSchema,
} from "./glossary.js";

describe("glossary schemas", () => {
  it("accepts a term and a definition", () => {
    expect(
      upsertGlossaryTranslationSchema.safeParse({ locale: "hu", term: "Feszültségesés", definition: "A vezeték ellenállásán eső feszültség." }).success,
    ).toBe(true);
  });

  it("rejects an empty term or definition", () => {
    expect(upsertGlossaryTranslationSchema.safeParse({ locale: "hu", term: " ", definition: "x" }).success).toBe(false);
    expect(upsertGlossaryTranslationSchema.safeParse({ locale: "hu", term: "x", definition: "" }).success).toBe(false);
  });

  it("term keys are slugs", () => {
    expect(termKeySchema.safeParse("voltage-drop").success).toBe(true);
    expect(termKeySchema.safeParse("Voltage Drop").success).toBe(false);
  });

  it("topic intros need text in a known locale", () => {
    expect(upsertTopicIntroSchema.safeParse({ locale: "hu", text: "Röviden a témáról." }).success).toBe(true);
    expect(upsertTopicIntroSchema.safeParse({ locale: "xx", text: "x" }).success).toBe(false);
    expect(upsertTopicIntroSchema.safeParse({ locale: "hu", text: "" }).success).toBe(false);
  });
});

describe("alphabetic index", () => {
  it("groups accented Hungarian letters with their base letter", () => {
    expect(glossaryLetter("Áramvédő")).toBe("A");
    expect(glossaryLetter("érintésvédelem")).toBe("E");
    expect(glossaryLetter("Ötvözet")).toBe("O");
    expect(glossaryLetter("űrlap")).toBe("U");
  });

  it("sorts in Hungarian order, ignoring case", () => {
    const sorted = sortGlossary([{ term: "védővezető" }, { term: "Áram" }, { term: "ellenállás" }, { term: "Zárlat" }], "hu");
    expect(sorted.map((item) => item.term)).toEqual(["Áram", "ellenállás", "védővezető", "Zárlat"]);
  });
});
