import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { glossaryFileSchema } from "./glossary-files.js";

const FILE = new URL("../../content/glossary/hu.json", import.meta.url);

describe("content/glossary/hu.json", () => {
  const entries = JSON.parse(readFileSync(FILE, "utf8")) as unknown;

  it("is valid and has unique keys", () => {
    expect(glossaryFileSchema.safeParse(entries).success).toBe(true);
  });

  it("covers the domain terms the project fixes in CLAUDE.md", () => {
    const parsed = glossaryFileSchema.parse(entries);
    const terms = parsed.map((entry) => entry.term.toLowerCase()).join(" | ");
    for (const word of ["feszültségesés", "keresztmetszet", "kismegszakító", "áram-védőkapcsoló", "érintésvédelem", "szigetelési ellenállás", "hurokimpedancia", "védővezető", "földelési ellenállás", "jegyzőkönyv"]) {
      expect(terms, word).toContain(word);
    }
  });

  it("states no numeric limits or standard numbers (those need a verified source)", () => {
    for (const entry of glossaryFileSchema.parse(entries)) {
      expect(entry.definition, entry.key).not.toMatch(/\b\d+\s?(V|A|mA|Ω|ohm|ms|s)\b/);
      expect(entry.definition, entry.key).not.toMatch(/MSZ|IEC|EN \d/);
    }
  });
});
