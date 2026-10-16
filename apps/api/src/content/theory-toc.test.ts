import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getTopic, isTopicId } from "@elektro/shared";
import { parseLessonPath } from "./lesson-files.js";

/**
 * docs/THEORY_TOC.md lists the paths the lesson authors must use. Every path
 * must pass the same rules the import applies, and match the syllabus - so
 * the brief and the app cannot drift apart.
 */
const toc = readFileSync(new URL("../../../../docs/THEORY_TOC.md", import.meta.url), "utf8");
// Real paths only (not the `<module>` template); a path may be mentioned twice.
const paths = [...new Set([...toc.matchAll(/`(hu\/[^`<>]+\.md)`/g)].map((match) => match[1]!))];

describe("docs/THEORY_TOC.md", () => {
  it("lists lesson paths", () => {
    expect(paths.length).toBeGreaterThan(50);
  });

  it("uses only paths the import accepts, with topics in their syllabus module", () => {
    for (const path of paths) {
      const parsed = parseLessonPath(path);
      expect(parsed.ok, path).toBe(true);
      if (!parsed.ok) continue;
      expect(isTopicId(parsed.topicId), path).toBe(true);
      if (isTopicId(parsed.topicId)) {
        expect(getTopic(parsed.topicId).module, path).toBe(parsed.module);
      }
    }
  });

  it("has unique slugs and positions 1..n within each topic", () => {
    const slugs = paths.map((path) => path.split("/").pop()!.slice(3));
    expect(new Set(slugs).size).toBe(slugs.length);

    const byTopic = new Map<string, number[]>();
    for (const path of paths) {
      const parsed = parseLessonPath(path);
      if (parsed.ok) byTopic.set(parsed.topicId, [...(byTopic.get(parsed.topicId) ?? []), parsed.position]);
    }
    for (const [topic, positions] of byTopic) {
      expect(positions, topic).toEqual(positions.map((_, index) => index + 1));
    }
  });
});
