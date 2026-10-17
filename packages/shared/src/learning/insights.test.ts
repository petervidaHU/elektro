import { describe, expect, it } from "vitest";
import type { StepState } from "../practice/types.js";
import { aggregateInsights } from "./insights.js";

const step = (stepId: string, verdicts: StepState["verdicts"], misconceptions: StepState["misconceptions"] = []): StepState => ({
  stepId,
  answers: verdicts.map(() => 1),
  verdicts,
  misconceptions,
  hintsUsed: 0,
  solutionShown: false,
  accepted: 1,
});

describe("aggregateInsights", () => {
  const insights = aggregateInsights([
    { topicId: "voltage-drop", templateId: "t", steps: [step("a", ["correct"]), step("b", ["incorrect", "correct"], ["percent-as-fraction"])] },
    { topicId: "voltage-drop", templateId: "t", steps: [step("a", ["incorrect", "correct"]), step("b", ["incorrect", "incorrect", "correct"], ["percent-as-fraction"])] },
  ]);

  it("ranks steps by the share of attempts that needed a retry", () => {
    const topic = insights.find((item) => item.topicId === "voltage-drop")!;
    expect(topic.steps.map((item) => [item.stepId, item.attempts, item.withErrors])).toEqual([
      ["b", 2, 2],
      ["a", 2, 1],
    ]);
    expect(topic.steps[0]!.errorRate).toBe(1);
    expect(topic.steps[1]!.errorRate).toBe(0.5);
  });

  it("counts misconceptions per topic, most frequent first", () => {
    expect(insights[0]!.misconceptions).toEqual([{ id: "percent-as-fraction", count: 2 }]);
  });

  it("ignores steps nobody has answered", () => {
    const empty = aggregateInsights([{ topicId: "voltage-drop", templateId: "t", steps: [step("a", [])] }]);
    expect(empty[0]!.steps).toEqual([]);
  });
});
