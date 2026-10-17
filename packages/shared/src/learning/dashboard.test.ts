import { describe, expect, it } from "vitest";
import { examReadiness, recommendNext, type TopicState } from "./dashboard.js";

const state = (level: TopicState["masteryLevel"], extra: Partial<TopicState> = {}): TopicState => ({
  masteryLevel: level,
  tasksCompleted: 0,
  unaidedRate: null,
  ...extra,
});

describe("recommendNext", () => {
  it("starts at the first available topic whose prerequisites are done", () => {
    const next = recommendNext({}, ["electrical-safety-basics", "isolation-procedure", "dc-circuits"]);
    expect(next).toEqual({ topicId: "electrical-safety-basics", reason: "start" });
  });

  it("moves on to the next unmastered topic once prerequisites are practised", () => {
    const next = recommendNext(
      { "electrical-safety-basics": state("mastered") },
      ["electrical-safety-basics", "isolation-procedure"],
    );
    expect(next).toEqual({ topicId: "isolation-procedure", reason: "next" });
  });

  it("does not block on prerequisites that have no content yet", () => {
    expect(recommendNext({}, ["isolation-procedure"])?.topicId).toBe("isolation-procedure");
  });

  it("prefers a topic with recent mistakes", () => {
    const next = recommendNext(
      {
        "electrical-safety-basics": state("mastered"),
        "dc-circuits": state("practising", { tasksCompleted: 6, unaidedRate: 0.3 }),
      },
      ["electrical-safety-basics", "dc-circuits", "isolation-procedure"],
    );
    expect(next).toEqual({ topicId: "dc-circuits", reason: "mistakes" });
  });

  it("returns null when everything available is mastered", () => {
    expect(recommendNext({ "dc-circuits": state("mastered") }, ["dc-circuits"])).toBeNull();
  });
});

describe("examReadiness", () => {
  it("counts topics of each exam part that are practising or mastered", () => {
    const strip = examReadiness({
      "voltage-drop": state("practising"),
    });
    const partIII = strip.find((part) => part.part === "III")!;
    expect(partIII.covered).toBe(1);
    expect(partIII.total).toBeGreaterThan(0);
    expect(partIII.share).toBeCloseTo(1 / partIII.total);
    expect(strip.map((part) => part.part)).toEqual(["base", "I", "II", "III", "IV"]);
  });

  it("does not count topics that are only started", () => {
    const strip = examReadiness({ "voltage-drop": state("started") });
    expect(strip.every((part) => part.covered === 0)).toBe(true);
  });
});
