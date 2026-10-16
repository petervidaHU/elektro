import { describe, expect, it } from "vitest";
import { LESSONS_ROOT } from "../scripts/content-root.js";
import { checkLessonFiles, loadLessonFiles } from "./lesson-files.js";

describe("bundled lesson files (content/lessons)", () => {
  it("pass the content check, so seeding can never store an invalid lesson", () => {
    const { files, issues } = loadLessonFiles(LESSONS_ROOT);
    expect([...issues, ...checkLessonFiles(files)]).toEqual([]);
    expect(files.length).toBeGreaterThan(0);
  });
});
