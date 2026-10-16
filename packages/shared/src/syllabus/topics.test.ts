import { describe, expect, it } from "vitest";
import {
  compareTopics,
  EXAM_PARTS,
  getTopic,
  isTopicId,
  MODULES,
  SPECIALISATIONS,
  TOPIC_IDS,
  TOPICS,
  topicsByModule,
  type TopicId,
} from "./topics.js";

/**
 * The syllabus is docs/DEVELOPMENT_PLAN.md §1.2 in data form. These tests keep
 * it internally consistent and traceable to the curriculum documents.
 */
describe("syllabus topics", () => {
  it("has exactly one metadata entry per topic ID", () => {
    expect(TOPICS.map((topic) => topic.id).sort()).toEqual([...TOPIC_IDS].sort());
    expect(new Set(TOPIC_IDS).size).toBe(TOPIC_IDS.length);
  });

  it("keeps every topic ID that existing database rows may reference", () => {
    const original: TopicId[] = [
      "dc-circuits",
      "ohms-law",
      "series-parallel-circuits",
      "power-and-energy",
      "ac-fundamentals",
      "three-phase-systems",
      "conductors-and-cross-section",
      "voltage-drop",
      "overcurrent-protection",
      "rcd-protection",
      "shock-protection",
      "earthing-and-bonding",
      "continuity-of-pe",
      "insulation-resistance",
      "loop-impedance",
      "rcd-testing",
      "earth-resistance",
      "measurement-report",
    ];
    for (const id of original) {
      expect(isTopicId(id), id).toBe(true);
    }
  });

  it("uses kebab-case IDs", () => {
    for (const id of TOPIC_IDS) {
      expect(id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it("places every topic in a known module with a unique order", () => {
    for (const module of MODULES) {
      const orders = topicsByModule(module).map((topic) => topic.order);
      expect(new Set(orders).size, `duplicate order in ${module}`).toBe(orders.length);
    }
    for (const topic of TOPICS) {
      expect(MODULES).toContain(topic.module);
    }
  });

  it("only references existing topics as prerequisites, never itself", () => {
    for (const topic of TOPICS) {
      for (const prerequisite of topic.prerequisites) {
        expect(isTopicId(prerequisite), `${topic.id} -> ${prerequisite}`).toBe(true);
        expect(prerequisite).not.toBe(topic.id);
      }
    }
  });

  it("has no prerequisite cycles", () => {
    const visiting = new Set<TopicId>();
    const done = new Set<TopicId>();

    const visit = (id: TopicId, path: TopicId[]): void => {
      if (done.has(id)) return;
      expect(visiting.has(id), `cycle: ${[...path, id].join(" -> ")}`).toBe(false);
      visiting.add(id);
      for (const prerequisite of getTopic(id).prerequisites) {
        visit(prerequisite, [...path, id]);
      }
      visiting.delete(id);
      done.add(id);
    };

    for (const id of TOPIC_IDS) visit(id, []);
  });

  it("traces every topic outside the other-specialisation module to the PTT", () => {
    for (const topic of TOPICS) {
      for (const ref of topic.ptt) {
        expect(ref, topic.id).toMatch(/^3\.\d+\.\d+\.6\.\d+$/);
      }
      for (const ref of topic.kkk) {
        expect(ref, topic.id).toMatch(/^(6\.2|6\.3|6\.4\.[123])\/\d+$/);
      }
      if (topic.module !== "other-specialisations") {
        expect(topic.ptt.length + topic.kkk.length, `${topic.id} has no curriculum ref`).toBeGreaterThan(0);
      }
    }
  });

  it("uses known exam parts and specialisations", () => {
    for (const topic of TOPICS) {
      for (const part of topic.examParts) expect(EXAM_PARTS).toContain(part);
      expect(topic.specialisations.length, topic.id).toBeGreaterThan(0);
      for (const specialisation of topic.specialisations) {
        expect(SPECIALISATIONS).toContain(specialisation);
      }
    }
  });

  it("keeps other-specialisation topics as IDs only (content phase 3)", () => {
    for (const topic of topicsByModule("other-specialisations")) {
      expect(topic.contentPhase).toBe(3);
      expect(topic.specialisations).not.toContain("building");
    }
  });

  it("covers the exam's calculation part with the milestone topics", () => {
    expect(getTopic("voltage-drop").examParts).toContain("III");
    expect(getTopic("current-carrying-capacity").examParts).toContain("III");
    expect(getTopic("voltage-drop").contentPhase).toBe(1);
  });

  it("flags the shock-protection topics as safety-critical", () => {
    for (const id of ["shock-protection", "isolation-procedure", "initial-verification"] as const) {
      expect(getTopic(id).safetyCritical, id).toBe(true);
    }
  });
});

describe("compareTopics", () => {
  it("orders by module, then by position inside the module", () => {
    const sorted = [...TOPIC_IDS].sort(compareTopics);

    expect(sorted[0]).toBe("electrical-safety-basics");
    expect(sorted.indexOf("ohms-law")).toBeLessThan(sorted.indexOf("voltage-drop"));
    expect(sorted.indexOf("dc-circuits")).toBeLessThan(sorted.indexOf("ohms-law"));
    expect(sorted.indexOf("voltage-drop")).toBeLessThan(sorted.indexOf("insulation-resistance"));
  });
});

describe("getTopic", () => {
  it("returns the metadata of a topic", () => {
    expect(getTopic("voltage-drop").module).toBe("sizing-and-protection");
  });
});
