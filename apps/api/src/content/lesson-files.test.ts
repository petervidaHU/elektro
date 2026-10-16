import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  checkLessonFiles,
  loadLessonFiles,
  parseFrontmatter,
  parseLessonPath,
  type LessonFile,
} from "./lesson-files.js";

describe("parseFrontmatter", () => {
  it("reads title, summary and the verify list, and returns the body", () => {
    const parsed = parseFrontmatter(
      [
        "---",
        "title: Ohm törvénye",
        'summary: "Feszültség, áram és ellenállás: az összefüggés."',
        "verify:",
        "  - A törpefeszültség határa (MSZ 1)",
        "  - Az ábra adatai",
        "---",
        "",
        "## Első szakasz",
      ].join("\n"),
    );

    expect(parsed).toEqual({
      ok: true,
      data: {
        title: "Ohm törvénye",
        summary: "Feszültség, áram és ellenállás: az összefüggés.",
        verify: ["A törpefeszültség határa (MSZ 1)", "Az ábra adatai"],
      },
      body: "## Első szakasz",
    });
  });

  it("fails without a front matter block", () => {
    expect(parseFrontmatter("## Csak szöveg").ok).toBe(false);
  });
});

describe("parseLessonPath", () => {
  it("takes locale, module, topic, position and slug from the path", () => {
    expect(parseLessonPath("hu/fundamentals/ohms-law/02-meres-ohm-torvenyevel.md")).toEqual({
      ok: true,
      locale: "hu",
      module: "fundamentals",
      topicId: "ohms-law",
      position: 2,
      slug: "meres-ohm-torvenyevel",
    });
  });

  it("rejects paths that do not follow the convention", () => {
    for (const path of [
      "hu/ohms-law/01-ohm.md",
      "hu/fundamentals/ohms-law/ohm.md",
      "hu/fundamentals/ohms-law/1-ohm.md",
      "hu/fundamentals/ohms-law/01-Ohm_Torveny.md",
      "hu/fundamentals/ohms-law/01-ohm.txt",
    ]) {
      expect(parseLessonPath(path).ok, path).toBe(false);
    }
  });
});

const lesson = (overrides: Partial<LessonFile> = {}): LessonFile => ({
  path: "hu/fundamentals/ohms-law/01-ohm-torvenye.md",
  locale: "hu",
  module: "fundamentals",
  topicId: "ohms-law",
  position: 1,
  slug: "ohm-torvenye",
  title: "Ohm törvénye",
  summary: "Az összefüggés.",
  verify: [],
  body: "## Szakasz\n\nSzöveg.",
  ...overrides,
});

describe("checkLessonFiles", () => {
  it("accepts a valid set", () => {
    expect(checkLessonFiles([lesson(), lesson({ path: "x", position: 2, slug: "masik" })])).toEqual([]);
  });

  it("reports an unknown locale or topic, and a topic in the wrong module", () => {
    const codes = (file: LessonFile) => checkLessonFiles([file]).map((issue) => issue.code);
    expect(codes(lesson({ locale: "de" }))).toContain("unknown-locale");
    expect(codes(lesson({ topicId: "no-such-topic" as LessonFile["topicId"] }))).toContain("unknown-topic");
    expect(codes(lesson({ module: "safety" }))).toContain("wrong-module");
  });

  it("reports duplicate slugs and duplicate positions within a topic", () => {
    const codes = checkLessonFiles([lesson(), lesson({ path: "b" })]).map((issue) => issue.code);
    expect(codes).toContain("duplicate-slug");
    expect(codes).toContain("duplicate-position");
  });

  it("reports a missing title and an invalid lesson body", () => {
    const codes = checkLessonFiles([lesson({ title: "", body: ":::quiz\nx\n:::" })]).map(
      (issue) => issue.code,
    );
    expect(codes).toEqual(expect.arrayContaining(["missing-title", "invalid-body"]));
  });

  it("reports a formula id that is not in the registry", () => {
    const issues = checkLessonFiles([lesson({ body: '::formula{id="ohms-law"}' })]);
    expect(issues.map((issue) => issue.code)).toContain("invalid-body");
    expect(issues[0]?.detail).toContain("unknown-formula");
  });
});

describe("loadLessonFiles", () => {
  it("reads every .md file under the root and reports unreadable ones", () => {
    const root = mkdtempSync(join(tmpdir(), "lessons-"));
    mkdirSync(join(root, "hu/fundamentals/ohms-law"), { recursive: true });
    writeFileSync(
      join(root, "hu/fundamentals/ohms-law/01-ohm-torvenye.md"),
      "---\ntitle: Ohm törvénye\nsummary: Az összefüggés.\n---\n\nSzöveg.\n",
    );
    writeFileSync(join(root, "hu/fundamentals/ohms-law/rossz.md"), "nincs front matter");
    writeFileSync(join(root, "hu/fundamentals/README.txt"), "nem lecke");

    const { files, issues } = loadLessonFiles(root);

    expect(files).toHaveLength(1);
    expect(files[0]).toMatchObject({ slug: "ohm-torvenye", topicId: "ohms-law", position: 1, body: "Szöveg." });
    expect(issues.map((issue) => issue.code)).toEqual(["bad-path"]);
  });
});
