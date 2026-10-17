import { describe, expect, it } from "vitest";
import { createRng } from "./rng.js";
import { allowedDeviation, compareAnswer, DEFAULT_TOLERANCES } from "./tolerance.js";
import { buildTask, evaluateStep, expectedFor, hintFor, MAX_HINT_LEVEL } from "./checker.js";
import { difficultyRamp, planSession, DEFAULT_SESSION_LENGTH, SESSION_LENGTHS } from "./session.js";
import { computeMastery, isStruggling, isStrugglingRate, taskOutcome, unaidedRate } from "./mastery.js";
import type { StepState, TaskTemplate } from "./types.js";

describe("createRng", () => {
  it("is deterministic for a seed, so client and server build the same task", () => {
    const a = createRng(42);
    const b = createRng(42);
    const draws = (rng: ReturnType<typeof createRng>) =>
      Array.from({ length: 5 }, () => rng.next());
    expect(draws(a)).toEqual(draws(b));
    expect(draws(createRng(43))).not.toEqual(draws(createRng(42)));
  });

  it("draws integers and steps within the bounds, and picks list items", () => {
    const rng = createRng(7);
    for (let i = 0; i < 500; i++) {
      const n = rng.int(3, 6);
      expect(n).toBeGreaterThanOrEqual(3);
      expect(n).toBeLessThanOrEqual(6);
      const stepped = rng.step(10, 60, 5);
      expect(stepped % 5).toBe(0);
      expect(stepped).toBeGreaterThanOrEqual(10);
      expect(stepped).toBeLessThanOrEqual(60);
      expect(["a", "b"]).toContain(rng.pick(["a", "b"]));
    }
  });
});

describe("tolerance", () => {
  it("defaults: 1 % final, 2 % intermediate, 0,05 points for percentages, exact selection", () => {
    expect(DEFAULT_TOLERANCES.final).toEqual({ relative: 0.01 });
    expect(DEFAULT_TOLERANCES.intermediate).toEqual({ relative: 0.02 });
    expect(DEFAULT_TOLERANCES.percent).toEqual({ absolute: 0.05 });
    expect(DEFAULT_TOLERANCES.selection).toEqual({ absolute: 0 });
  });

  it("computes the allowed deviation", () => {
    expect(allowedDeviation(7.2, { relative: 0.01 })).toBeCloseTo(0.072, 12);
    expect(allowedDeviation(3.13, { absolute: 0.05 })).toBe(0.05);
  });

  it("marks answers correct within tolerance, close within 3x, otherwise incorrect", () => {
    const tolerance = { relative: 0.01 };
    expect(compareAnswer(7.2, 7.2, tolerance)).toBe("correct");
    expect(compareAnswer(7.2, 7.25, tolerance)).toBe("correct");
    expect(compareAnswer(7.2, 7.4, tolerance)).toBe("close");
    expect(compareAnswer(7.2, 7.5, tolerance)).toBe("incorrect");
    expect(compareAnswer(7.2, -7.2, tolerance)).toBe("incorrect");
  });

  it("requires an exact match for selections", () => {
    expect(compareAnswer(2.5, 2.5, DEFAULT_TOLERANCES.selection)).toBe("correct");
    expect(compareAnswer(2.5, 4, DEFAULT_TOLERANCES.selection)).toBe("incorrect");
  });
});

/** A two-step stand-in: a = x * 2, then b = a + 1 (b uses the student's own a). */
const DOUBLE_PLUS_ONE: TaskTemplate = {
  id: "test.double-plus-one",
  version: 1,
  topicId: "ohms-law",
  difficulty: 1,
  scenarioKey: () => "test",
  generate: (rng) => ({ x: rng.int(1, 9) }),
  givens: (params) => [{ id: "x", value: Number(params["x"]), unit: "dimensionless" }],
  steps: [
    {
      id: "a",
      unit: "dimensionless",
      kind: "intermediate",
      formulaId: () => "conductor-resistance",
      expected: (params) => Number(params["x"]) * 2,
      substitution: (params) => `a = ${String(params["x"])} · 2`,
      misconceptions: [{ id: "phase-factor-missing", value: (params) => Number(params["x"]) }],
    },
    {
      id: "b",
      unit: "dimensionless",
      kind: "final",
      formulaId: () => "voltage-drop",
      expected: (_params, prior) => (prior["a"] ?? Number.NaN) + 1,
      substitution: (_params, prior) => `b = ${String(prior["a"])} + 1`,
    },
  ],
};

describe("evaluateStep", () => {
  const task = { template: DOUBLE_PLUS_ONE, params: { x: 5 } };

  it("checks an answer against the expected value", () => {
    expect(evaluateStep(task, 0, {}, 10).verdict).toBe("correct");
    expect(evaluateStep(task, 0, {}, 12).verdict).toBe("incorrect");
  });

  it("names a known mistake when the wrong answer matches it", () => {
    expect(evaluateStep(task, 0, {}, 5)).toEqual({
      verdict: "incorrect",
      misconceptionId: "phase-factor-missing",
    });
  });

  it("carries the student's own accepted earlier answer forward", () => {
    // a = 10.1 was accepted (within 2 %); b is then checked against 10.1 + 1.
    expect(expectedFor(task, 1, { a: 10.1 })).toBeCloseTo(11.1, 12);
    expect(evaluateStep(task, 1, { a: 10.1 }, 11.1).verdict).toBe("correct");
  });
});

describe("hintFor", () => {
  const task = { template: DOUBLE_PLUS_ONE, params: { x: 5 } };

  it("gives three levels: a concept text, the formula, then the substitution", () => {
    expect(MAX_HINT_LEVEL).toBe(3);
    expect(hintFor(task, 0, 1, {}, "hu")).toEqual({ type: "text", stepId: "a" });
    expect(hintFor(task, 0, 2, {}, "hu")).toEqual({
      type: "formula",
      formulaId: "conductor-resistance",
    });
    expect(hintFor(task, 0, 3, {}, "hu")).toEqual({ type: "substitution", text: "a = 5 · 2" });
  });
});

describe("buildTask", () => {
  it("rebuilds the same parameters from template id and seed", () => {
    const first = buildTask("voltage-drop.single-phase-basic", 123);
    const again = buildTask("voltage-drop.single-phase-basic", 123);
    expect(again.params).toEqual(first.params);
  });

  it("throws for an unknown template", () => {
    expect(() => buildTask("no-such-template", 1)).toThrow();
  });
});

describe("session plan", () => {
  it("offers 3, 5 or 10 tasks, 5 by default", () => {
    expect(SESSION_LENGTHS).toEqual([3, 5, 10]);
    expect(DEFAULT_SESSION_LENGTH).toBe(5);
  });

  it("ramps difficulty up across the session", () => {
    expect(difficultyRamp(3)).toEqual([1, 2, 3]);
    expect(difficultyRamp(5)).toEqual([1, 2, 2, 3, 3]);
    expect(difficultyRamp(10)).toEqual([1, 1, 2, 2, 2, 2, 3, 3, 3, 3]);
  });

  it("plans tasks from the topic's templates, one seed each", () => {
    let next = 0;
    const plan = planSession("voltage-drop", 5, () => ++next);
    expect(plan).toHaveLength(5);
    expect(plan.map((task) => task.difficulty)).toEqual([1, 2, 2, 3, 3]);
    expect(plan.map((task) => task.seed)).toEqual([1, 2, 3, 4, 5]);
    for (const task of plan) {
      expect(task.templateId.startsWith("voltage-drop.")).toBe(true);
      expect(task.templateVersion).toBeGreaterThan(0);
    }
  });

  it("refuses a topic without practice templates", () => {
    expect(() => planSession("measurement-report", 5, () => 1)).toThrow();
  });
});

const step = (overrides: Partial<StepState> = {}): StepState => ({
  stepId: "s",
  answers: [],
  verdicts: [],
  misconceptions: [],
  hintsUsed: 0,
  solutionShown: false,
  accepted: null,
  ...overrides,
});

describe("taskOutcome", () => {
  it("is in progress until every step is resolved", () => {
    expect(taskOutcome([step({ accepted: 1 }), step()], 2)).toBe("in_progress");
    expect(taskOutcome([step({ accepted: 1 })], 2)).toBe("in_progress");
  });

  it("is unaided without hints and solutions - wrong tries are fine", () => {
    expect(taskOutcome([step({ accepted: 1, verdicts: ["incorrect", "correct"] })], 1)).toBe(
      "unaided",
    );
  });

  it("is with_help after a hint, solution_shown after a revealed step", () => {
    expect(taskOutcome([step({ accepted: 1, hintsUsed: 1 })], 1)).toBe("with_help");
    expect(taskOutcome([step({ accepted: 1, hintsUsed: 2, solutionShown: true })], 1)).toBe(
      "solution_shown",
    );
  });
});

describe("computeMastery (plan §3.6)", () => {
  const base = {
    lessonsTotal: 1,
    lessonsOpened: 0,
    lessonsCompleted: 0,
    hasPractice: true,
    tasksStarted: 0,
    completedTasks: [] as { difficulty: 1 | 2 | 3; outcome: "unaided" | "with_help" | "solution_shown" }[],
  };

  it("is none without activity, started after opening a lesson or a task", () => {
    expect(computeMastery(base)).toBe("none");
    expect(computeMastery({ ...base, lessonsOpened: 1 })).toBe("started");
    expect(computeMastery({ ...base, tasksStarted: 1 })).toBe("started");
  });

  it("is practising after a completed lesson or a solved task", () => {
    expect(computeMastery({ ...base, lessonsOpened: 1, lessonsCompleted: 1 })).toBe("practising");
    expect(
      computeMastery({ ...base, tasksStarted: 1, completedTasks: [{ difficulty: 1, outcome: "with_help" }] }),
    ).toBe("practising");
  });

  it("is mastered with all lessons done and 3 of the last 5 harder tasks unaided", () => {
    const strong = [
      { difficulty: 1, outcome: "unaided" },
      { difficulty: 2, outcome: "unaided" },
      { difficulty: 2, outcome: "with_help" },
      { difficulty: 3, outcome: "unaided" },
      { difficulty: 3, outcome: "unaided" },
    ] as const;
    const done = { ...base, lessonsOpened: 1, lessonsCompleted: 1, tasksStarted: 5 };

    expect(computeMastery({ ...done, completedTasks: [...strong] })).toBe("mastered");
    // Not all lessons completed yet.
    expect(computeMastery({ ...done, lessonsTotal: 2, completedTasks: [...strong] })).toBe(
      "practising",
    );
    // Only difficulty-1 tasks do not count.
    expect(
      computeMastery({
        ...done,
        completedTasks: Array.from({ length: 5 }, () => ({ difficulty: 1, outcome: "unaided" }) as const),
      }),
    ).toBe("practising");
  });

  it("masters a topic without practice tasks by completing its lessons", () => {
    expect(
      computeMastery({ ...base, hasPractice: false, lessonsOpened: 1, lessonsCompleted: 1 }),
    ).toBe("mastered");
  });
});

describe("unaidedRate / isStruggling", () => {
  const tasks = (outcomes: ("unaided" | "with_help")[]) =>
    outcomes.map((outcome) => ({ difficulty: 2 as const, outcome }));

  it("is the share of unaided tasks among the last 10, or null without tasks", () => {
    expect(unaidedRate([])).toBeNull();
    expect(unaidedRate(tasks(["unaided", "with_help"]))).toBe(0.5);
  });

  it("flags struggling below 40 % unaided over at least 5 tasks", () => {
    expect(isStruggling(tasks(["with_help", "with_help", "with_help", "unaided"]))).toBe(false);
    expect(isStruggling(tasks(["with_help", "with_help", "with_help", "with_help", "unaided"]))).toBe(true);
    expect(isStruggling(tasks(["with_help", "with_help", "unaided", "unaided", "with_help"]))).toBe(false);
  });
});

describe("isStrugglingRate", () => {
  it("applies the 40 % / 5 tasks rule to the cached figures", () => {
    expect(isStrugglingRate(0.3, 6)).toBe(true);
    expect(isStrugglingRate(0.3, 4)).toBe(false);
    expect(isStrugglingRate(0.4, 10)).toBe(false);
    expect(isStrugglingRate(null, 10)).toBe(false);
  });
});
