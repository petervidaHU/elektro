import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { validateLessonBody } from "@elektro/shared";
import { LESSON_DRAFTS } from "./content-manifest.js";

describe("bundled lesson drafts", () => {
  it("pass lesson-body validation, so the seed can never store an invalid body", () => {
    for (const draft of LESSON_DRAFTS) {
      const body = readFileSync(new URL(`../../content/lessons/${draft.file}`, import.meta.url), "utf8");
      expect(validateLessonBody(body), draft.slug).toEqual({ ok: true, errors: [] });
    }
  });

  it("use unique slugs", () => {
    const slugs = LESSON_DRAFTS.map((draft) => draft.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
